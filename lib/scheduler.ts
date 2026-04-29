import { EventConfig, RoundPlan, SessionPlan } from "@/lib/types";

type PairKey = string;

const pairKey = (a: string, b: string): PairKey => (a < b ? `${a}|${b}` : `${b}|${a}`);

const repeatPenaltyWeight = {
  low: 1,
  medium: 8,
  high: 24,
} as const;

function overlapPenalty(candidateId: string, seated: string[], pairCounts: Map<PairKey, number>, weight: number): number {
  let penalty = 0;
  for (const seatedId of seated) {
    const repeats = pairCounts.get(pairKey(candidateId, seatedId)) ?? 0;
    penalty += repeats * weight;
  }
  return penalty;
}

function assignRound(
  attendeeIds: string[],
  tableSizes: number[],
  pairCounts: Map<PairKey, number>,
  weight: number
): { tables: string[][]; repeatedPairs: number } {
  const shuffled = [...attendeeIds].sort(() => Math.random() - 0.5);
  const tables = tableSizes.map(() => [] as string[]);

  for (const attendeeId of shuffled) {
    let bestIdx = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < tables.length; i += 1) {
      const seated = tables[i];
      if (seated.length >= tableSizes[i]) continue;
      const score = overlapPenalty(attendeeId, seated, pairCounts, weight) + seated.length * 0.01;
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) {
      throw new Error("Not enough table capacity for attendees.");
    }
    tables[bestIdx].push(attendeeId);
  }

  let repeatedPairs = 0;
  for (const seated of tables) {
    for (let i = 0; i < seated.length; i += 1) {
      for (let j = i + 1; j < seated.length; j += 1) {
        const key = pairKey(seated[i], seated[j]);
        const previousCount = pairCounts.get(key) ?? 0;
        if (previousCount > 0) repeatedPairs += 1;
        pairCounts.set(key, previousCount + 1);
      }
    }
  }

  return { tables, repeatedPairs };
}

export function generateSchedule(config: EventConfig): SessionPlan {
  const totalCapacity = config.tables.reduce((sum, table) => sum + table.capacity, 0);
  if (config.attendees.length === 0) {
    throw new Error("Add at least one attendee.");
  }
  if (config.rounds < 1) {
    throw new Error("Rounds must be at least 1.");
  }
  if (totalCapacity < config.attendees.length) {
    throw new Error("Table capacity must cover all attendees.");
  }

  const pairCounts = new Map<PairKey, number>();
  const tableSizes = config.tables.map((t) => t.capacity);
  const attendeeIds = config.attendees.map((a) => a.id);
  const weight = repeatPenaltyWeight[config.repeatAvoidance];

  const rounds: RoundPlan[] = [];
  let totalRepeatedPairs = 0;

  for (let roundIndex = 0; roundIndex < config.rounds; roundIndex += 1) {
    const attempts = config.repeatAvoidance === "high" ? 18 : config.repeatAvoidance === "medium" ? 8 : 3;
    let best: { tables: string[][]; repeatedPairs: number; snapshot: Map<PairKey, number> } | null = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const snapshot = new Map(pairCounts);
      const result = assignRound(attendeeIds, tableSizes, snapshot, weight);
      if (!best || result.repeatedPairs < best.repeatedPairs) {
        best = { ...result, snapshot };
      }
      if (result.repeatedPairs === 0) break;
    }

    if (!best) throw new Error("Failed to generate round.");
    pairCounts.clear();
    for (const [k, v] of best.snapshot) pairCounts.set(k, v);

    rounds.push({
      id: `round-${roundIndex + 1}`,
      index: roundIndex + 1,
      tables: best.tables.map((attendeeIdsForTable, tableIdx) => ({
        tableId: config.tables[tableIdx].id,
        tableName: config.tables[tableIdx].name,
        attendeeIds: attendeeIdsForTable,
      })),
      repeatedPairCount: best.repeatedPairs,
    });
    totalRepeatedPairs += best.repeatedPairs;
  }

  return { rounds, totalRepeatedPairs };
}

export function recomputeRepeatedPairs(rounds: RoundPlan[]): SessionPlan {
  const pairCounts = new Map<PairKey, number>();
  let totalRepeatedPairs = 0;

  const recomputedRounds = rounds.map((round) => {
    let repeatedPairCount = 0;
    for (const table of round.tables) {
      for (let i = 0; i < table.attendeeIds.length; i += 1) {
        for (let j = i + 1; j < table.attendeeIds.length; j += 1) {
          const key = pairKey(table.attendeeIds[i], table.attendeeIds[j]);
          const previous = pairCounts.get(key) ?? 0;
          if (previous > 0) repeatedPairCount += 1;
          pairCounts.set(key, previous + 1);
        }
      }
    }
    totalRepeatedPairs += repeatedPairCount;
    return { ...round, repeatedPairCount };
  });

  return {
    rounds: recomputedRounds,
    totalRepeatedPairs,
  };
}

export function moveAttendeeInRound(params: {
  round: RoundPlan;
  attendeeId: string;
  fromTableId: string;
  toTableId: string;
  tableCapacities: Record<string, number>;
}): RoundPlan {
  const { round, attendeeId, fromTableId, toTableId, tableCapacities } = params;
  if (fromTableId === toTableId) return round;

  const fromTable = round.tables.find((table) => table.tableId === fromTableId);
  const toTable = round.tables.find((table) => table.tableId === toTableId);

  if (!fromTable || !toTable) {
    throw new Error("Invalid table selected for move.");
  }
  if (!fromTable.attendeeIds.includes(attendeeId)) {
    throw new Error("Attendee not found in source table.");
  }
  if (toTable.attendeeIds.includes(attendeeId)) {
    throw new Error("Attendee already exists in destination table.");
  }

  const destinationCapacity = tableCapacities[toTableId] ?? Number.POSITIVE_INFINITY;
  if (toTable.attendeeIds.length >= destinationCapacity) {
    throw new Error("Destination table is full.");
  }

  const updatedTables = round.tables.map((table) => {
    if (table.tableId === fromTableId) {
      return { ...table, attendeeIds: table.attendeeIds.filter((id) => id !== attendeeId) };
    }
    if (table.tableId === toTableId) {
      return { ...table, attendeeIds: [...table.attendeeIds, attendeeId] };
    }
    return table;
  });

  validateRound(round.id, updatedTables, tableCapacities);
  return { ...round, tables: updatedTables };
}

export function swapAttendeesInRound(params: {
  round: RoundPlan;
  sourceAttendeeId: string;
  sourceTableId: string;
  targetAttendeeId: string;
  targetTableId: string;
  tableCapacities: Record<string, number>;
}): RoundPlan {
  const { round, sourceAttendeeId, sourceTableId, targetAttendeeId, targetTableId, tableCapacities } = params;
  if (sourceTableId === targetTableId) return round;
  if (sourceAttendeeId === targetAttendeeId) return round;

  const sourceTable = round.tables.find((table) => table.tableId === sourceTableId);
  const targetTable = round.tables.find((table) => table.tableId === targetTableId);
  if (!sourceTable || !targetTable) {
    throw new Error("Invalid table selected for swap.");
  }
  if (!sourceTable.attendeeIds.includes(sourceAttendeeId) || !targetTable.attendeeIds.includes(targetAttendeeId)) {
    throw new Error("Swap attendees not found in selected tables.");
  }

  const updatedTables = round.tables.map((table) => {
    if (table.tableId === sourceTableId) {
      return {
        ...table,
        attendeeIds: table.attendeeIds.map((id) => (id === sourceAttendeeId ? targetAttendeeId : id)),
      };
    }
    if (table.tableId === targetTableId) {
      return {
        ...table,
        attendeeIds: table.attendeeIds.map((id) => (id === targetAttendeeId ? sourceAttendeeId : id)),
      };
    }
    return table;
  });

  validateRound(round.id, updatedTables, tableCapacities);
  return { ...round, tables: updatedTables };
}

function validateRound(roundId: string, tables: RoundPlan["tables"], tableCapacities: Record<string, number>) {
  const seen = new Set<string>();
  for (const table of tables) {
    const cap = tableCapacities[table.tableId];
    if (typeof cap === "number" && table.attendeeIds.length > cap) {
      throw new Error(`Table capacity exceeded in ${table.tableName}.`);
    }
    for (const attendeeId of table.attendeeIds) {
      if (seen.has(attendeeId)) {
        throw new Error(`Duplicate attendee assignment detected in ${roundId}.`);
      }
      seen.add(attendeeId);
    }
  }
}

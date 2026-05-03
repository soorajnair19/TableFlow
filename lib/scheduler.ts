import { EventConfig, RoundPlan, SessionPlan, Table } from "@/lib/types";

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

function resolvedSeatCapacity(capacity: Table["capacity"]): number {
  if (capacity === "") return 0;
  const n = Math.floor(Number(capacity));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function generateSchedule(config: EventConfig): SessionPlan {
  const tableSizes = config.tables.map((t) => resolvedSeatCapacity(t.capacity));
  const totalCapacity = tableSizes.reduce((sum, cap) => sum + cap, 0);
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

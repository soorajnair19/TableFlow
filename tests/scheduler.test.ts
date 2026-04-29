import assert from "node:assert/strict";
import test from "node:test";
import { generateSchedule, moveAttendeeInRound, recomputeRepeatedPairs, swapAttendeesInRound } from "../lib/scheduler";
import { EventConfig } from "../lib/types";

const baseConfig: EventConfig = {
  attendees: Array.from({ length: 24 }, (_, i) => ({ id: `a-${i + 1}`, name: `Attendee ${i + 1}` })),
  tables: Array.from({ length: 4 }, (_, i) => ({ id: `t-${i + 1}`, name: `Table ${i + 1}`, capacity: 6 })),
  rounds: 4,
  repeatAvoidance: "medium",
};

test("creates requested number of rounds", () => {
  const plan = generateSchedule(baseConfig);
  assert.equal(plan.rounds.length, baseConfig.rounds);
});

test("assigns every attendee exactly once per round", () => {
  const plan = generateSchedule(baseConfig);
  for (const round of plan.rounds) {
    const ids = round.tables.flatMap((table) => table.attendeeIds);
    assert.equal(ids.length, baseConfig.attendees.length);
    assert.equal(new Set(ids).size, baseConfig.attendees.length);
  }
});

test("high repeat avoidance should be no worse than low", () => {
  const low = generateSchedule({ ...baseConfig, repeatAvoidance: "low" });
  const high = generateSchedule({ ...baseConfig, repeatAvoidance: "high" });
  assert.ok(high.totalRepeatedPairs <= low.totalRepeatedPairs);
});

test("recomputes repeated pairs after manual attendee move", () => {
  const plan = recomputeRepeatedPairs([
    {
      id: "round-1",
      index: 1,
      repeatedPairCount: 0,
      tables: [
        { tableId: "t1", tableName: "Table 1", attendeeIds: ["a1", "a2", "a3"] },
        { tableId: "t2", tableName: "Table 2", attendeeIds: ["a4", "a5"] },
      ],
    },
    {
      id: "round-2",
      index: 2,
      repeatedPairCount: 0,
      tables: [
        { tableId: "t1", tableName: "Table 1", attendeeIds: ["a1", "a4"] },
        { tableId: "t2", tableName: "Table 2", attendeeIds: ["a2", "a3", "a5"] },
      ],
    },
  ]);
  const firstRound = plan.rounds[0];
  const sourceTable = firstRound.tables[0];
  const destinationTable = firstRound.tables[1];
  const attendeeId = "a3";

  const movedRound = moveAttendeeInRound({
    round: firstRound,
    attendeeId,
    fromTableId: sourceTable.tableId,
    toTableId: destinationTable.tableId,
    tableCapacities: { t1: 3, t2: 3 },
  });

  const updatedPlan = recomputeRepeatedPairs(
    plan.rounds.map((round, idx) => (idx === 0 ? movedRound : round))
  );
  const movedSource = updatedPlan.rounds[0].tables.find((t) => t.tableId === sourceTable.tableId);
  const movedDest = updatedPlan.rounds[0].tables.find((t) => t.tableId === destinationTable.tableId);

  assert.ok(movedSource && !movedSource.attendeeIds.includes(attendeeId));
  assert.ok(movedDest && movedDest.attendeeIds.includes(attendeeId));
});

test("rejects manual move into a full table", () => {
  const round = {
    id: "round-1",
    index: 1,
    repeatedPairCount: 0,
    tables: [
      { tableId: "t1", tableName: "Table 1", attendeeIds: ["a1", "a2"] },
      { tableId: "t2", tableName: "Table 2", attendeeIds: ["a3", "a4"] },
    ],
  };

  assert.throws(
    () =>
      moveAttendeeInRound({
        round,
        attendeeId: "a1",
        fromTableId: "t1",
        toTableId: "t2",
        tableCapacities: { t1: 2, t2: 2 },
      }),
    /Destination table is full/
  );
});

test("swaps attendees across tables when dropped on another attendee", () => {
  const round = {
    id: "round-1",
    index: 1,
    repeatedPairCount: 0,
    tables: [
      { tableId: "t1", tableName: "Table 1", attendeeIds: ["a1", "a2"] },
      { tableId: "t2", tableName: "Table 2", attendeeIds: ["a3", "a4"] },
    ],
  };

  const swapped = swapAttendeesInRound({
    round,
    sourceAttendeeId: "a1",
    sourceTableId: "t1",
    targetAttendeeId: "a4",
    targetTableId: "t2",
    tableCapacities: { t1: 2, t2: 2 },
  });

  assert.deepEqual(swapped.tables[0].attendeeIds, ["a4", "a2"]);
  assert.deepEqual(swapped.tables[1].attendeeIds, ["a3", "a1"]);
});

import assert from "node:assert/strict";
import test from "node:test";
import { generateSchedule } from "../lib/scheduler";
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

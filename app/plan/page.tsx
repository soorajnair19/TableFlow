"use client";

import { InfoCircle, Settings01, XClose } from "@untitledui/icons";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RoundView } from "@/components/round-view";
import { AppShell, Button, Card, Container, StepHeader } from "@/components/ui";
import { generateSchedule } from "@/lib/scheduler";
import { useSessionStore } from "@/store/session";

type RepeatedPairDetail = {
  key: string;
  repetition: string;
  attendeePair: string;
  metBefore: string;
};

export default function PlanPage() {
  const config = useSessionStore((s) => s.config);
  const plan = useSessionStore((s) => s.plan);
  const setPlan = useSessionStore((s) => s.setPlan);
  const currentRoundIndex = useSessionStore((s) => s.currentRoundIndex);
  const setRound = useSessionStore((s) => s.setRound);
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const currentRound = plan?.rounds[currentRoundIndex];
  const repeatedPairDetails = useMemo<RepeatedPairDetail[]>(() => {
    if (!plan) return [];
    const attendeeNameById = new Map(config?.attendees.map((attendee) => [attendee.id, attendee.name]) ?? []);
    const pairSeenCounts = new Map<string, number>();
    const pairLastSeenLocation = new Map<string, { round: number; tableName: string }>();
    const rows: RepeatedPairDetail[] = [];

    for (const round of plan.rounds) {
      for (const table of round.tables) {
        for (let i = 0; i < table.attendeeIds.length; i += 1) {
          for (let j = i + 1; j < table.attendeeIds.length; j += 1) {
            const a = table.attendeeIds[i];
            const b = table.attendeeIds[j];
            const pairKey = a < b ? `${a}|${b}` : `${b}|${a}`;
            const seen = pairSeenCounts.get(pairKey) ?? 0;

            if (seen > 0) {
              const aName = attendeeNameById.get(a) ?? a;
              const bName = attendeeNameById.get(b) ?? b;
              const previousLocation = pairLastSeenLocation.get(pairKey);
              if (!previousLocation) {
                continue;
              }
              rows.push({
                key: `${round.id}-${table.tableId}-${pairKey}`,
                repetition: `Round ${round.index} - ${table.tableName}`,
                attendeePair: aName < bName ? `${aName} & ${bName}` : `${bName} & ${aName}`,
                metBefore: `Round ${previousLocation.round} - ${previousLocation.tableName}`,
              });
            }
            pairSeenCounts.set(pairKey, seen + 1);
            pairLastSeenLocation.set(pairKey, { round: round.index, tableName: table.tableName });
          }
        }
      }
    }

    return rows;
  }, [config?.attendees, plan]);

  if (!config || !plan) {
    return (
      <AppShell>
        <Container>
          <Card>
            <p className="text-sm text-neutral-600">No plan generated yet.</p>
            <Link href="/" className="mt-3 inline-block text-sm font-medium text-neutral-900 underline">
              Back to setup
            </Link>
          </Card>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <StepHeader
        step="Step 2: Plan Review"
        title="Review generated rounds"
        subtitle="Validate repeated pairings and confirm the plan before going live."
        actions={
          <>
            <Link href="/">
              <Button variant="secondary" className="gap-2">
                <Settings01 className="size-4" />
                Configure
              </Button>
            </Link>
            <Link href="/live">
              <Button onClick={() => setRound(0)}>Go Live</Button>
            </Link>
          </>
        }
      />
      <Container className="space-y-6 pt-36 pb-8">

        <Card className="space-y-3">
          <div className="flex items-center gap-1 text-sm text-neutral-600">
            <p>
              Total repeated pairs: <span className="font-semibold text-neutral-900">{plan.totalRepeatedPairs}</span>
            </p>
            <button
              type="button"
              aria-label="View repeated pair details"
              title="View repeated pair details"
              onClick={() => setShowRepeatModal(true)}
              className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            >
              <InfoCircle className="size-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {plan.rounds.map((round, idx) => (
                <Button key={round.id} variant={idx === currentRoundIndex ? "primary" : "secondary"} onClick={() => setRound(idx)}>
                  Round {round.index}
                </Button>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setPlan(generateSchedule(config))}>
              Regenerate
            </Button>
          </div>
        </Card>

        {currentRound ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Round {currentRound.index}</h2>
            <RoundView round={currentRound} attendees={config.attendees} />
          </div>
        ) : null}
      </Container>

      {showRepeatModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Repeated Pairs</h3>
              <button
                type="button"
                onClick={() => setShowRepeatModal(false)}
                className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Close repeated pairs modal"
              >
                <XClose className="size-5" />
              </button>
            </div>

            {repeatedPairDetails.length === 0 ? (
              <p className="text-sm text-neutral-600">No repeated pairs found.</p>
            ) : (
              <div className="max-h-[60vh] overflow-auto rounded-xl border border-neutral-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-neutral-50 text-neutral-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Repetition</th>
                      <th className="px-4 py-3 font-medium">Attendee Pair</th>
                      <th className="px-4 py-3 font-medium">Met Before</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repeatedPairDetails.map((item) => (
                      <tr key={item.key} className="border-t border-neutral-200">
                        <td className="px-4 py-3">{item.repetition}</td>
                        <td className="px-4 py-3">{item.attendeePair}</td>
                        <td className="px-4 py-3">{item.metBefore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoundView } from "@/components/round-view";
import { AppShell, Button, Card, Container } from "@/components/ui";
import { useSessionStore } from "@/store/session";

function formatTimer(seconds: number) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function LivePage() {
  const config = useSessionStore((s) => s.config);
  const plan = useSessionStore((s) => s.plan);
  const currentRoundIndex = useSessionStore((s) => s.currentRoundIndex);
  const setRound = useSessionStore((s) => s.setRound);
  const initialSeconds = useMemo(() => (config?.durationMinutes ?? 0) * 60, [config?.durationMinutes]);
  const currentRound = plan?.rounds[currentRoundIndex];

  if (!config || !plan || !currentRound) {
    return (
      <AppShell>
        <Container>
          <Card>
            <p className="text-sm text-neutral-600">Live mode needs a generated plan first.</p>
            <Link href="/attendees" className="mt-3 inline-block text-sm font-medium text-neutral-900 underline">
              Back to setup
            </Link>
          </Card>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Container className="space-y-5 pt-6 pb-6">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {plan.rounds.map((round, idx) => (
              <Button key={round.id} variant={idx === currentRoundIndex ? "primary" : "secondary"} onClick={() => setRound(idx)}>
                Round {round.index}
              </Button>
            ))}
          </div>
          {config.durationMinutes ? (
            <TimerControls key={`${currentRoundIndex}-${initialSeconds}`} initialSeconds={initialSeconds} />
          ) : null}
        </Card>

        <RoundView round={currentRound} attendees={config.attendees} />
      </Container>
    </AppShell>
  );
}

function TimerControls({ initialSeconds }: { initialSeconds: number }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, timerRunning]);

  return (
    <div className="flex items-center gap-2">
      <p
        className={`min-w-20 text-right text-2xl font-semibold tabular-nums ${
          secondsLeft <= 60 ? "text-red-600" : "text-neutral-900"
        }`}
      >
        {formatTimer(secondsLeft)}
      </p>
      <Button
        variant="secondary"
        onClick={() => setTimerRunning((v) => !v)}
        aria-label={timerRunning ? "Pause timer" : "Start timer"}
        title={timerRunning ? "Pause timer" : "Start timer"}
      >
        {timerRunning ? (
          <span aria-hidden className="text-base leading-none">
            ⏸
          </span>
        ) : (
          <span aria-hidden className="text-base leading-none">
            ▶
          </span>
        )}
      </Button>
      <Button
        variant="secondary"
        onClick={() => setSecondsLeft(initialSeconds)}
        aria-label="Reset timer"
        title="Reset timer"
      >
        <span aria-hidden className="text-base leading-none">
          ↺
        </span>
      </Button>
    </div>
  );
}

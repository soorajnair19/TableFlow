"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionStep } from "@/components/setup-form";
import { AppShell, Container, StepHeader } from "@/components/ui";
import { useSessionStore } from "@/store/session";

export default function SessionPage() {
  const router = useRouter();
  const setupAttendees = useSessionStore((s) => s.setupAttendees);
  const config = useSessionStore((s) => s.config);
  const hasPlan = useSessionStore((s) => Boolean(s.plan));

  const hasAttendees = setupAttendees.length > 0 || (config?.attendees?.length ?? 0) > 0;

  useEffect(() => {
    if (!hasAttendees) {
      router.replace("/attendees");
    }
  }, [hasAttendees, router]);

  if (!hasAttendees) {
    return null;
  }

  return (
    <AppShell>
      <StepHeader
        step="Step 2: Setup Session"
        title="Setup session"
        subtitle="Configure tables, rounds, duration, and repeat avoidance."
        stepperItems={[
          { label: "Step 1: Add Attendees", href: "/attendees", state: "completed" },
          { label: "Step 2: Setup Session", href: "/session", state: "current" },
          { label: "Step 3: Review", href: "/plan", state: hasPlan ? "completed" : "disabled" },
        ]}
      />
      <Container className="space-y-8 pt-44 pb-10">
        <SessionStep />
      </Container>
    </AppShell>
  );
}

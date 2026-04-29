"use client";

import { SetupForm } from "@/components/setup-form";
import { AppShell, Container, StepHeader } from "@/components/ui";
import { useSessionStore } from "@/store/session";

export default function GeneratePage() {
  const hasPlan = useSessionStore((s) => Boolean(s.plan));

  return (
    <AppShell>
      <StepHeader
        step="Step 1: Configure"
        title="Configure your networking session"
        subtitle="Add attendees, set tables and rounds, then generate an optimized plan."
        stepperItems={[
          { label: "Step 1: Configure", href: "/generate", state: "current" },
          { label: "Step 2: Review", href: "/plan", state: hasPlan ? "completed" : "disabled" },
        ]}
      />
      <Container className="space-y-8 pt-44 pb-10">
        <SetupForm />
      </Container>
    </AppShell>
  );
}

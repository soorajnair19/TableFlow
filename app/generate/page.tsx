"use client";

import { SetupForm } from "@/components/setup-form";
import { AppShell, Container, StepHeader } from "@/components/ui";

export default function GeneratePage() {
  return (
    <AppShell>
      <StepHeader
        step="Step 1: Generate"
        title="Configure your networking session"
        subtitle="Add attendees, set tables and rounds, then generate an optimized plan."
      />
      <Container className="space-y-8 pt-36 pb-10">
        <SetupForm />
      </Container>
    </AppShell>
  );
}

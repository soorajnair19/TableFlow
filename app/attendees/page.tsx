"use client";

import { AttendeesStep } from "@/components/setup-form";
import { AppShell, Container, StepHeader } from "@/components/ui";
import { useSessionStore } from "@/store/session";

export default function AttendeesPage() {
  const hasPlan = useSessionStore((s) => Boolean(s.plan));

  return (
    <AppShell>
      <StepHeader
        step="Step 1: Add Attendees"
        title="Add attendees"
        subtitle="Upload a list, paste names, or add people one at a time."
        stepperItems={[
          { label: "Step 1: Add Attendees", href: "/attendees", state: "current" },
          { label: "Step 2: Setup Session", href: "/session", state: "disabled" },
          { label: "Step 3: Review", href: "/plan", state: hasPlan ? "completed" : "disabled" },
        ]}
      />
      <Container className="space-y-8 pt-44 pb-10">
        <AttendeesStep />
      </Container>
    </AppShell>
  );
}

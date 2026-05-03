"use client";

import { AttendeesStep } from "@/components/setup-form";
import { AppShell, Container, StepHeader } from "@/components/ui";
import { useSessionStore } from "@/store/session";

export default function AttendeesPage() {
  const config = useSessionStore((s) => s.config);
  const setupAttendees = useSessionStore((s) => s.setupAttendees);
  const hasPlan = useSessionStore((s) => Boolean(s.plan));
  const hasAttendees = setupAttendees.length > 0 || (config?.attendees?.length ?? 0) > 0;
  const step2State = hasPlan ? "completed" : hasAttendees ? "available" : "disabled";

  return (
    <AppShell>
      <StepHeader
        step="Step 1: Add Attendees"
        title="Add attendees"
        subtitle="Upload a list, paste names, or add people one at a time."
        stepperItems={[
          { label: "Step 1: Add Attendees", href: "/attendees", state: "current" },
          { label: "Step 2: Setup Session", href: "/session", state: step2State },
          { label: "Step 3: Review", href: "/plan", state: hasPlan ? "completed" : "disabled" },
        ]}
      />
      <Container className="space-y-8 pt-44 pb-10">
        <AttendeesStep />
      </Container>
    </AppShell>
  );
}

import Link from "next/link";
import { AppShell, Button, PAGE_INNER } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <AppShell>
      <main className="relative flex h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(42,24,239,0.16),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(0,28,181,0.12),transparent_40%)]" />

        <section className={cn(PAGE_INNER, "relative z-10 flex flex-col items-center justify-center text-center")}>
          <p className="mb-5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700">
            TableFlow
          </p>
          <h1 className="max-w-5xl text-5xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-6xl">
            Stop running networking sessions
            <br />
            on spreadsheets
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-neutral-600">
            Set up attendees, assign tables, and generate smart rounds that avoid repeats.
            <br />
            So you can focus on hosting, not juggling sheets.
          </p>
          <div className="mt-10">
            <Link href="/attendees">
              <Button className="h-12 rounded-2xl px-8 text-base">Get Started</Button>
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

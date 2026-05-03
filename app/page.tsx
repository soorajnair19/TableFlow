import Image from "next/image";
import Link from "next/link";
import { AppShell, Button } from "@/components/ui";

/** https://unsplash.com/photos/people-inside-restaurant-sn5YdKelBsg — Toa Heftiba / Unsplash */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1501353163335-102e39d92607?auto=format&fit=crop&w=1600&q=80";

export default function Home() {
  return (
    <AppShell>
      <main className="relative flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden">
        <div className="relative h-48 shrink-0 md:h-full md:w-[33%] md:min-h-0">
          <Image
            src={HERO_IMAGE}
            alt="People inside a restaurant"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center md:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(42,24,239,0.16),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(0,28,181,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_15%_80%,rgba(42,24,239,0.22),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(0,28,181,0.14),transparent_40%)]" />

          <section className="relative z-10 flex max-w-3xl flex-col items-center">
            <p className="mb-5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              TableFlow
            </p>
            <h1 className="max-w-5xl text-5xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-50">
              Stop running
              <br />
              networking sessions
              <br />
              on spreadsheets
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-neutral-600 dark:text-neutral-400">
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
        </div>
      </main>
    </AppShell>
  );
}

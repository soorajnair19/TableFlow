"use client";

import { InfoCircle, Upload01, XClose } from "@untitledui/icons";
import Papa from "papaparse";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { generateSchedule } from "@/lib/scheduler";
import { EventConfig, Table } from "@/lib/types";
import { uid } from "@/lib/utils";
import { useSessionStore } from "@/store/session";
import { Button, Card, Input, SectionTitle, Textarea } from "@/components/ui";

function ensureCustomTables(count: number, prev: Table[]): Table[] {
  const safeCount = Math.max(1, count);
  if (prev.length === safeCount) return prev;
  if (prev.length > safeCount) return prev.slice(0, safeCount);
  const additions = Array.from({ length: safeCount - prev.length }, (_, i) => ({
    id: uid(),
    name: `Table ${prev.length + i + 1}`,
    capacity: 6,
  }));
  return [...prev, ...additions];
}

export function AttendeesStep() {
  const router = useRouter();
  const config = useSessionStore((s) => s.config);
  const setupAttendees = useSessionStore((s) => s.setupAttendees);
  const setupAttendeesUserCleared = useSessionStore((s) => s.setupAttendeesUserCleared);
  const setSetupAttendees = useSessionStore((s) => s.setSetupAttendees);

  const [manualName, setManualName] = useState("");
  const [pasteNames, setPasteNames] = useState("");
  const [error, setError] = useState<string | null>(null);

  /** Seed Step 1 from last generated `config` only when the list is empty and the user did not explicitly clear it (e.g. "Remove all"). */
  useEffect(() => {
    if (setupAttendees.length > 0) return;
    if (setupAttendeesUserCleared) return;
    if (config?.attendees?.length) {
      setSetupAttendees(config.attendees);
    }
  }, [config?.attendees, setSetupAttendees, setupAttendees.length, setupAttendeesUserCleared]);

  const attendees = setupAttendees;

  const addAttendee = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const prev = useSessionStore.getState().setupAttendees;
    setSetupAttendees([...prev, { id: uid(), name: trimmed }]);
  };

  const parseAndAddNames = (raw: string) => {
    const names = raw
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    const prev = useSessionStore.getState().setupAttendees;
    const additions = names.map((name) => ({ id: uid(), name }));
    setSetupAttendees([...prev, ...additions]);
  };

  const onCsvUpload = (file: File) => {
    Papa.parse<string[]>(file, {
      complete: (results) => {
        for (const row of results.data) {
          if (!Array.isArray(row)) continue;
          for (const cell of row) {
            if (typeof cell === "string" && cell.trim()) {
              addAttendee(cell);
            }
          }
        }
      },
      error: () => setError("Failed to parse CSV."),
    });
  };

  return (
    <Card>
      <SectionTitle title={`Attendees (${attendees.length})`} subtitle="CSV upload, paste names, or add manually." />
      <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-600 hover:bg-neutral-50">
            <Upload01 className="size-4" />
            Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onCsvUpload(e.target.files[0])}
            />
          </label>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">OR</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          <Textarea
            value={pasteNames}
            placeholder="Paste comma or newline separated names"
            rows={4}
            onChange={(e) => setPasteNames(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              parseAndAddNames(pasteNames);
              setPasteNames("");
            }}
          >
            Add Pasted Names
          </Button>
          <div className="flex gap-2">
            <Input value={manualName} placeholder="Add attendee name" onChange={(e) => setManualName(e.target.value)} />
            <Button
              onClick={() => {
                addAttendee(manualName);
                setManualName("");
              }}
            >
              Add
            </Button>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-neutral-500">
                <strong className="text-neutral-800">{attendees.length}</strong> attendees
              </p>
              <button
                type="button"
                onClick={() => setSetupAttendees([])}
                disabled={attendees.length === 0}
                className="text-xs font-medium text-neutral-500 underline-offset-2 transition hover:text-neutral-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove all
              </button>
            </div>
            <div className="flex max-h-44 flex-wrap gap-2 overflow-auto">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs"
                >
                  <span>{attendee.name}</span>
                  <button
                    type="button"
                    onClick={() => setSetupAttendees(attendees.filter((a) => a.id !== attendee.id))}
                    className="rounded-full p-0.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                    aria-label={`Remove ${attendee.name}`}
                    title={`Remove ${attendee.name}`}
                  >
                    <XClose className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <Link href="/">
              <Button variant="secondary" type="button">
                Back
              </Button>
            </Link>
            <Button
              type="button"
              disabled={attendees.length === 0}
              onClick={() => router.push("/session")}
            >
              Continue
            </Button>
          </div>
      </div>
    </Card>
  );
}

export function SessionStep() {
  const router = useRouter();
  const config = useSessionStore((s) => s.config);
  const setupAttendees = useSessionStore((s) => s.setupAttendees);
  const setupSession = useSessionStore((s) => s.setupSession);
  const setSetupSession = useSessionStore((s) => s.setSetupSession);
  const setConfig = useSessionStore((s) => s.setConfig);
  const setPlan = useSessionStore((s) => s.setPlan);

  const [error, setError] = useState<string | null>(null);

  const {
    rounds,
    durationMinutes,
    repeatAvoidance,
    useEqual,
    tableCount,
    customTables,
  } = setupSession;

  const attendees = setupAttendees.length > 0 ? setupAttendees : (config?.attendees ?? []);

  const syncCustomTables = (nextCount: number) => {
    const prev = useSessionStore.getState().setupSession.customTables;
    setSetupSession({ customTables: ensureCustomTables(nextCount, prev) });
  };

  const equalDistributionTables = useMemo(() => {
    if (attendees.length === 0 || tableCount < 1) {
      return Array.from({ length: Math.max(tableCount, 1) }, (_, i) => ({
        id: uid(),
        name: `Table ${i + 1}`,
        capacity: 1,
      }));
    }
    const base = Math.floor(attendees.length / tableCount);
    const extra = attendees.length % tableCount;
    return Array.from({ length: tableCount }, (_, i) => ({
      id: uid(),
      name: `Table ${i + 1}`,
      capacity: base + (i < extra ? 1 : 0),
    }));
  }, [attendees.length, tableCount]);

  const computedTables = useMemo(
    () => (useEqual ? equalDistributionTables : customTables),
    [customTables, equalDistributionTables, useEqual]
  );

  const equalDistributionLine = useMemo(() => {
    const safeTables = Math.max(1, tableCount);
    const attendeeTotal = attendees.length;
    const base = Math.floor(attendeeTotal / safeTables);
    const max = Math.ceil(attendeeTotal / safeTables);

    if (attendeeTotal === 0) {
      return (
        <p className="text-sm text-neutral-600">
          Add attendees to preview equal distribution across <strong>{safeTables}</strong> tables.
        </p>
      );
    }

    if (attendeeTotal % safeTables === 0) {
      return (
        <p className="text-sm text-neutral-600">
          <strong>{attendeeTotal}</strong> attendees equally divided into <strong>{safeTables}</strong> tables:{" "}
          <strong>{base}</strong> attendees per table.
        </p>
      );
    }

    return (
      <p className="text-sm text-neutral-600">
        <strong>{attendeeTotal}</strong> attendees equally divided into <strong>{safeTables}</strong> tables:{" "}
        <strong>~{base}-{max}</strong> attendees per table.
      </p>
    );
  }, [attendees.length, tableCount]);

  const onGenerate = () => {
    try {
      setError(null);
      if (attendees.length === 0) {
        throw new Error("Add at least one attendee in the previous step.");
      }
      const tables = useEqual ? computedTables : customTables;
      const eventConfig: EventConfig = {
        attendees,
        tables,
        rounds,
        durationMinutes: durationMinutes === "" ? undefined : durationMinutes,
        repeatAvoidance,
        uiPreferences: {
          useEqual,
          tableCount,
          customTables,
        },
      };
      const plan = generateSchedule(eventConfig);
      setConfig(eventConfig);
      setPlan(plan);
      router.push("/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate session plan.");
    }
  };

  return (
    <Card>
      <SectionTitle title="Session Setup" subtitle="Configure tables, rounds, and repeat control." />
      <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-neutral-600">Tables</p>
              <Input
                type="number"
                min={1}
                max={30}
                value={tableCount}
                onChange={(e) => {
                  const nextCount = Number(e.target.value) || 1;
                  setSetupSession({ tableCount: nextCount });
                  syncCustomTables(nextCount);
                }}
              />
            </div>
            <div>
              <p className="mb-1 text-sm text-neutral-600">Networking Rounds</p>
              <Input
                type="number"
                min={1}
                max={20}
                value={rounds}
                onChange={(e) => setSetupSession({ rounds: Number(e.target.value) || 1 })}
              />
            </div>
            <div>
              <p className="mb-1 text-sm text-neutral-600">Round Duration (min)</p>
              <Input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setSetupSession({ durationMinutes: e.target.value ? Number(e.target.value) : "" })}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1">
              <p className="text-sm text-neutral-600">Repeat Avoidance</p>
              <div className="group relative inline-flex">
                <button
                  type="button"
                  className="rounded-full p-0.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                  aria-label="Repeat Avoidance info"
                >
                  <InfoCircle className="size-4" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 opacity-0 shadow-sm transition group-hover:opacity-100">
                  Controls how strongly scheduling avoids repeating the same attendee pairs across rounds.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["low", "medium", "high"] as const).map((level) => (
                <label
                  key={level}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800"
                >
                  <input
                    type="radio"
                    name="repeat-avoidance"
                    value={level}
                    checked={repeatAvoidance === level}
                    onChange={() => setSetupSession({ repeatAvoidance: level })}
                    className="size-4 accent-[#001CB5]"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <p className="text-sm text-neutral-600">Distribution</p>
              <div className="group relative inline-flex">
                <button
                  type="button"
                  className="rounded-full p-0.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                  aria-label="Distribution info"
                >
                  <InfoCircle className="size-4" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 opacity-0 shadow-sm transition group-hover:opacity-100">
                  Choose attendee distribution mode: equal split across all tables or fully custom capacities.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="distribution-mode"
                  value="equal"
                  checked={useEqual}
                  onChange={() => setSetupSession({ useEqual: true })}
                  className="size-4 accent-[#001CB5]"
                />
                <span>Equal distribution</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="distribution-mode"
                  value="custom"
                  checked={!useEqual}
                  onChange={() => {
                    const prev = useSessionStore.getState().setupSession.customTables;
                    const nextCustom =
                      prev.length > 0 ? prev : ensureCustomTables(tableCount, []);
                    setSetupSession({ useEqual: false, customTables: nextCustom });
                  }}
                  className="size-4 accent-[#001CB5]"
                />
                <span>Custom capacities</span>
              </label>
            </div>
            {useEqual ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">{equalDistributionLine}</div>
            ) : (
              <div className="space-y-2">
                {customTables.map((table, idx) => (
                  <div className="grid grid-cols-6 gap-2" key={table.id}>
                    <Input
                      className="col-span-4"
                      value={table.name}
                      onChange={(e) => {
                        const next = customTables.map((t, i) => (i === idx ? { ...t, name: e.target.value } : t));
                        setSetupSession({ customTables: next });
                      }}
                    />
                    <Input
                      className="col-span-2"
                      type="number"
                      min={1}
                      value={table.capacity}
                      onChange={(e) => {
                        const next = customTables.map((t, i) =>
                          i === idx ? { ...t, capacity: Number(e.target.value) || 1 } : t
                        );
                        setSetupSession({ customTables: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => router.push("/attendees")}>
              Back
            </Button>
            <Button className="min-w-40" type="button" onClick={onGenerate}>
              Generate Plan
            </Button>
          </div>
      </div>
    </Card>
  );
}

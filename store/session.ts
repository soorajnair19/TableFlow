"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Attendee, EventConfig, RepeatAvoidance, SessionPlan, Table } from "@/lib/types";
import { uid } from "@/lib/utils";

export type SetupSessionDraft = {
  rounds: number;
  durationMinutes: number | "";
  repeatAvoidance: RepeatAvoidance;
  useEqual: boolean;
  tableCount: number;
  customTables: Table[];
};

type SessionState = {
  config: EventConfig | null;
  plan: SessionPlan | null;
  setupAttendees: Attendee[];
  /** When true, Step 1 list was intentionally emptied — do not re-fill from `config.attendees`. */
  setupAttendeesUserCleared: boolean;
  setupSession: SetupSessionDraft;
  currentRoundIndex: number;
  sessionStarted: boolean;
  setConfig: (config: EventConfig) => void;
  setPlan: (plan: SessionPlan) => void;
  setSetupAttendees: (attendees: Attendee[]) => void;
  setSetupSession: (partial: Partial<SetupSessionDraft>) => void;
  startSession: () => void;
  nextRound: () => void;
  setRound: (idx: number) => void;
  reset: () => void;
};

const defaultCustomTables = (tableCount: number): Table[] =>
  Array.from({ length: Math.max(1, tableCount) }, (_, i) => ({
    id: uid(),
    name: `Table ${i + 1}`,
    capacity: 6,
  }));

const defaultSetupSession = (): SetupSessionDraft => ({
  rounds: 4,
  durationMinutes: 12,
  repeatAvoidance: "medium",
  useEqual: true,
  tableCount: 6,
  customTables: defaultCustomTables(6),
});

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      config: null,
      plan: null,
      setupAttendees: [],
      setupAttendeesUserCleared: false,
      setupSession: defaultSetupSession(),
      currentRoundIndex: 0,
      sessionStarted: false,
      setConfig: (config) => set({ config }),
      setPlan: (plan) => set({ plan, currentRoundIndex: 0, sessionStarted: false }),
      setSetupAttendees: (attendees) =>
        set({
          setupAttendees: attendees,
          setupAttendeesUserCleared: attendees.length === 0,
        }),
      setSetupSession: (partial) =>
        set((state) => ({
          setupSession: { ...state.setupSession, ...partial },
        })),
      startSession: () => set({ sessionStarted: true }),
      nextRound: () => {
        const plan = get().plan;
        if (!plan) return;
        set((state) => ({
          currentRoundIndex: Math.min(state.currentRoundIndex + 1, plan.rounds.length - 1),
        }));
      },
      setRound: (idx) => set({ currentRoundIndex: idx }),
      reset: () =>
        set({
          config: null,
          plan: null,
          currentRoundIndex: 0,
          sessionStarted: false,
          setupAttendees: [],
          setupAttendeesUserCleared: false,
          setupSession: defaultSetupSession(),
        }),
    }),
    {
      name: "tableflow-session-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        plan: state.plan,
        setupAttendees: state.setupAttendees,
        setupAttendeesUserCleared: state.setupAttendeesUserCleared,
        setupSession: state.setupSession,
        currentRoundIndex: state.currentRoundIndex,
        sessionStarted: state.sessionStarted,
      }),
    }
  )
);

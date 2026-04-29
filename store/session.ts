"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { EventConfig, SessionPlan } from "@/lib/types";

type SessionState = {
  config: EventConfig | null;
  plan: SessionPlan | null;
  currentRoundIndex: number;
  sessionStarted: boolean;
  setConfig: (config: EventConfig) => void;
  setPlan: (plan: SessionPlan) => void;
  updatePlan: (plan: SessionPlan) => void;
  startSession: () => void;
  nextRound: () => void;
  setRound: (idx: number) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      config: null,
      plan: null,
      currentRoundIndex: 0,
      sessionStarted: false,
      setConfig: (config) => set({ config }),
      setPlan: (plan) => set({ plan, currentRoundIndex: 0, sessionStarted: false }),
      updatePlan: (plan) => set({ plan }),
      startSession: () => set({ sessionStarted: true }),
      nextRound: () => {
        const plan = get().plan;
        if (!plan) return;
        set((state) => ({
          currentRoundIndex: Math.min(state.currentRoundIndex + 1, plan.rounds.length - 1),
        }));
      },
      setRound: (idx) => set({ currentRoundIndex: idx }),
      reset: () => set({ config: null, plan: null, currentRoundIndex: 0, sessionStarted: false }),
    }),
    {
      name: "tableflow-session-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        plan: state.plan,
        currentRoundIndex: state.currentRoundIndex,
        sessionStarted: state.sessionStarted,
      }),
    }
  )
);

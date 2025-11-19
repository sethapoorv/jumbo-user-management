"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApiUser } from "@/types/user.types";

export type ActivityLogEntry = {
  id: string;
  type?: string;
  message?: string;
  ts?: number;
  meta?: Record<string, any>;
};

type AppState = {
  dark: boolean;
  toggleDark: () => void;
  setDark: (v: boolean) => void;

  loggedInUser?: ApiUser | null;
  setLoggedInUser: (u: ApiUser | null) => void;

  // activity log
  activityLog: ActivityLogEntry[];
  addActivityLog: (entry: ActivityLogEntry) => void;
  clearActivityLog: () => void;
};

/* ---- theme helpers ---- */
function readSavedTheme(): "dark" | "light" | undefined {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return "dark";
    if (saved === "light") return "light";
  } catch {}
  return undefined;
}
function applyHtmlDarkClass(enabled: boolean) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", enabled);
  }
}

/* ---- store ---- */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const saved =
        typeof window !== "undefined" ? readSavedTheme() : undefined;
      const initialDark = saved === undefined ? true : saved === "dark";
      if (typeof window !== "undefined") applyHtmlDarkClass(initialDark);

      return {
        dark: initialDark,
        toggleDark: () =>
          set((s) => {
            const next = !s.dark;
            if (typeof window !== "undefined") {
              applyHtmlDarkClass(next);
              try {
                localStorage.setItem("theme", next ? "dark" : "light");
              } catch {}
            }
            return { dark: next };
          }),
        setDark: (v) =>
          set(() => {
            if (typeof window !== "undefined") {
              applyHtmlDarkClass(v);
              try {
                localStorage.setItem("theme", v ? "dark" : "light");
              } catch {}
            }
            return { dark: v };
          }),

        loggedInUser: null,
        setLoggedInUser: (u) => set({ loggedInUser: u }),

        // activity log
        activityLog: [],
        addActivityLog: (entry) =>
          set((state) => ({
            activityLog: [
              {
                ...entry,
                ts: entry.ts ?? Date.now(),
                id:
                  entry.id ??
                  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              },
              ...state.activityLog,
            ],
          })),
        clearActivityLog: () => set({ activityLog: [] }),
      };
    },
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAppStore;

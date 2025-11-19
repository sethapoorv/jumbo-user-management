"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApiUser } from "@/types/user.types";

type AppState = {
  dark: boolean;
  toggleDark: () => void;
  setDark: (v: boolean) => void;

  loggedInUser?: ApiUser | null;
  setLoggedInUser: (u: ApiUser | null) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      dark: true,
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      setDark: (v: boolean) => set({ dark: v }),

      loggedInUser: null,
      setLoggedInUser: (u) => set({ loggedInUser: u }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

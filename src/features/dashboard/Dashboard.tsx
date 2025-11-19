"use client";

import React from "react";
import UsersTable from "@/features/users/UsersTable";
import { useAppStore } from "@/app/stores/useAppStore";

export default function UsersDashboard() {
  const dark = useAppStore((s) => s.dark);

  return (
    <main
      className={`min-h-screen w-full transition-colors duration-300 ${
        dark ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <section className="max-w-6xl mx-auto pt-3">
        <header className="px-6 py-6">
          <h2
            className={`text-2xl font-bold ${
              dark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Users
          </h2>
          <p
            className={`text-sm ${dark ? "text-slate-300" : "text-slate-500"}`}
          >
            View, search, filter, add & manage users.
          </p>
        </header>

        <UsersTable isDark={dark} />
      </section>
    </main>
  );
}

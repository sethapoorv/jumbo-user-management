"use client";

import ToggleButton from "@/components/toggle-button/ToggleButton";
import UsersTable from "@/features/users/UsersTable";
import { useState } from "react";

export default function UsersDashboard() {
  const [isDark, setIsDark] = useState(true);

  return (
    <main
      className={`h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <div className="absolute top-6 right-6">
        <ToggleButton isOn={isDark} onToggle={() => setIsDark(!isDark)} />
      </div>
      <section className="max-w-6xl mx-auto">
        <header className="px-6 py-6">
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-sm text-slate-500">
            View, search, filter, add & manage users.
          </p>
        </header>

        <UsersTable />
      </section>
    </main>
  );
}

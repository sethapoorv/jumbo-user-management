"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Avatar from "@radix-ui/react-avatar";
import * as Switch from "@radix-ui/react-switch";
import { useAppStore } from "@/app/stores/useAppStore";
import ToggleButton from "../toggle-button/ToggleButton";

function initialsFromName(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dark = useAppStore((s) => s.dark);
  const toggleDark = useAppStore((s) => s.toggleDark);
  const loggedInUser = useAppStore((s) => s.loggedInUser);

  const bg = dark
    ? "bg-slate-900 border-slate-700"
    : "bg-white border-slate-200";
  const text = dark ? "text-slate-100" : "text-slate-800";
  const linkText = dark
    ? "text-slate-300 hover:text-white"
    : "text-slate-600 hover:text-slate-900";
  const mobilePanelBg = dark
    ? "bg-slate-900/95 border-slate-700"
    : "bg-white/95 border-slate-200";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/users", label: "Users" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className={`w-full border-b ${bg} ${text} sticky top-0 z-50`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg tracking-wide hover:opacity-80"
        >
          Dashboard
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 text-sm font-medium">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={linkText}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${
                dark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Try our new Dark Mode!
            </span>

            <ToggleButton className="shadow-md" />
          </div>

          <div className="flex items-center gap-3 ml-2">
            <Avatar.Root
              className={`inline-flex items-center justify-center rounded-full h-9 w-9 ${
                dark ? "bg-indigo-600" : "bg-indigo-600"
              }`}
            >
              <Avatar.Fallback
                className="text-white font-semibold text-sm"
                delayMs={600}
              >
                {initialsFromName(loggedInUser?.name)}
              </Avatar.Fallback>
            </Avatar.Root>

            <div className="hidden sm:block">
              <div
                className={`text-sm font-medium ${
                  dark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {loggedInUser?.name ?? "No user"}
              </div>
              <div
                className={`text-xs ${
                  dark ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {loggedInUser?.email ?? ""}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Switch.Root
            checked={dark}
            onCheckedChange={toggleDark}
            className={`w-10 h-5 rounded-full p-[2px] relative focus:outline-none ${
              dark ? "bg-slate-700" : "bg-gray-200"
            }`}
            aria-label="Toggle dark mode"
          >
            <Switch.Thumb
              className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-150 ${
                dark ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </Switch.Root>

          <button
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={`ml-2 inline-flex items-center justify-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              dark
                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                : "bg-white text-slate-700 hover:bg-gray-100"
            }`}
          >
            {open ? (
              <Cross2Icon className="w-5 h-5" />
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden transition-max-h duration-200 ease-in-out overflow-hidden border-t ${mobilePanelBg}`}
        style={{ maxHeight: open ? 240 : 0 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-3 py-2 rounded-md font-medium ${linkText}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            <div className="pt-2 border-t mt-2 border-transparent">
              <div
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {loggedInUser
                  ? `Signed in as ${loggedInUser.name}`
                  : "Not signed in"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

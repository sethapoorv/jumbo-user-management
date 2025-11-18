"use client";

import React from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

type ToggleButtonProps = {
  isOn: boolean;
  onToggle: () => void;
  ariaLabel?: string;
  className?: string;
};

export default function ToggleButton({
  isOn,
  onToggle,
  ariaLabel = "Toggle theme",
  className = "",
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isOn}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={[
        "inline-flex items-center justify-center p-3 rounded-lg shadow-lg transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        isOn
          ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
          : "bg-white text-slate-700 hover:bg-gray-100",
        className,
      ].join(" ")}
    >
      {isOn ? (
        <SunIcon className="w-10 h-10 text-current" />
      ) : (
        <MoonIcon className="w-10 h-10 text-current" />
      )}
    </button>
  );
}

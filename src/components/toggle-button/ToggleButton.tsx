"use client";

import React from "react";
import * as Switch from "@radix-ui/react-switch";
import { useAppStore } from "@/app/stores/useAppStore";

type ToggleButtonProps = {
  isOn?: boolean;
  onToggle?: () => void;
  className?: string;
};

export default function ToggleButton({
  isOn: isOnProp,
  onToggle: onToggleProp,
  className = "",
}: ToggleButtonProps) {
  const storeDark = useAppStore((s) => s.dark);
  const storeToggle = useAppStore((s) => s.toggleDark);

  const isControlled =
    typeof isOnProp === "boolean" && typeof onToggleProp === "function";

  const isOn = isControlled ? isOnProp! : storeDark;
  const onToggle = isControlled ? onToggleProp! : () => storeToggle();

  return (
    <Switch.Root
      checked={isOn}
      onCheckedChange={onToggle}
      aria-label="Toggle dark mode"
      className={[
        "relative inline-flex h-6 w-11 rounded-full transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        isOn ? "bg-slate-700" : "bg-gray-300",
        className,
      ].join(" ")}
    >
      <Switch.Thumb
        className={[
          "ml-0.5 mt-0.5 block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200",
          isOn ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </Switch.Root>
  );
}

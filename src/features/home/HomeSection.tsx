"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import ToggleButton from "@/components/toggle-button/ToggleButton";
import { useRouter } from "next/navigation";

export default function HomeSection() {
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/dashboard");
  };

  return (
    <main
      className={`h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <div className="absolute top-6 right-6">
        <ToggleButton isOn={isDark} onToggle={() => setIsDark(!isDark)} />
      </div>

      <div className="h-full flex items-center justify-center px-4">
        <div className="text-center space-y-8">
          <h1
            className={`text-6xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            User Management
          </h1>
          <p
            className={`text-xl ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Manage your users efficiently
          </p>

          <button
            onClick={handleNavigation}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 ${
              isDark
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            } shadow-lg`}
          >
            Access Dashboard
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";

import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ApiUser } from "@/types/user.types";
import UserProfileCard from "./UserProfile";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/stores/useAppStore";

export type UserDetailClientProps = { id: string };

export default function UserDetailClient({ id }: UserDetailClientProps) {
  const router = useRouter();
  const dark = useAppStore((s) => s.dark);

  const themeMain = dark
    ? "bg-slate-900 text-slate-100"
    : "bg-slate-50 text-slate-900";

  const themeCard = dark
    ? "bg-slate-800 border-slate-700 text-slate-200"
    : "bg-white border-slate-200 text-slate-700";

  const themeError = dark
    ? "bg-rose-900/40 border-rose-800 text-rose-200"
    : "bg-rose-50 border-rose-200 text-rose-700";

  const themeWarning = dark
    ? "bg-yellow-900/60 border-yellow-800 text-yellow-100"
    : "bg-yellow-100 border-yellow-300 text-yellow-900";

  if (!id || id === "undefined") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className={`rounded-md border p-4 ${themeWarning}`}>
          Invalid user id.
        </div>
      </div>
    );
  }

  const { data, isLoading, isError, error } = useQuery<ApiUser>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await axios.get(
        `https://jsonplaceholder.typicode.com/users/${id}`
      );
      return res.data;
    },
    enabled: Boolean(id) && id !== "undefined",
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  return (
    <main className={`w-full mt-10 py-8 px-4 rounded-lg ${themeMain}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>

          <button
            onClick={() => router.back()}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition ${themeCard}`}
          >
            ← Back
          </button>
        </div>

        {isLoading && (
          <div className={`p-6 rounded-lg border ${themeCard}`}>
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-48 bg-gray-400/30 rounded" />
              <div className="h-4 w-64 bg-gray-400/30 rounded" />
              <div className="h-40 bg-gray-400/30 rounded" />
            </div>
          </div>
        )}

        {isError && (
          <div className={`p-4 rounded-lg border ${themeError}`}>
            Error loading user: {error?.message ?? "Unknown error"}
          </div>
        )}

        {data && <UserProfileCard user={data} />}
      </div>
    </main>
  );
}

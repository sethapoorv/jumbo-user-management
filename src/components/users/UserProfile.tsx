"use client";

import React from "react";
import { ApiUser } from "@/types/user.types";
import {
  EnvelopeOpenIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

type Props = { user: ApiUser };

function lineOrDash(v?: string | null) {
  return v && v.length > 0 ? v : "-";
}

export default function UserProfileCard({ user }: Props) {
  const fullAddress = user.address
    ? `${lineOrDash(user.address.street)}, ${lineOrDash(user.address.city)} ${
        user.address.zipcode ?? ""
      }`
    : "-";

  return (
    <article className="rounded-2xl overflow-hidden border bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="p-6 md:p-8 flex gap-6">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold dark:from-indigo-500 dark:to-indigo-700">
            {initialsFromName(user.name || "")}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {user.name}
              </h2>
              <div className="text-sm text-slate-500 mt-1 dark:text-slate-300">
                @{user.username}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-400 dark:text-slate-400">
                Company
              </div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                {user.company?.name ?? "-"}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoTile label="Email" value={lineOrDash(user.email)}>
              <EnvelopeOpenIcon className="h-5 w-5 text-sky-700 dark:text-sky-300" />
            </InfoTile>

            <InfoTile label="Phone" value={lineOrDash(user.phone)}>
              <PhoneIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            </InfoTile>

            <InfoTile label="Company" value={user.company?.name ?? "-"}>
              <BuildingOfficeIcon className="h-5 w-5 text-violet-600 dark:text-violet-300" />
            </InfoTile>

            <InfoTile label="Full address" value={fullAddress}>
              <MapPinIcon className="h-5 w-5 text-rose-600 dark:text-rose-300" />
            </InfoTile>
          </div>

          {user.website && (
            <div className="mt-6 text-sm text-slate-700 dark:text-slate-300">
              Website:{" "}
              <a
                className="text-sky-600 dark:text-sky-300 hover:underline"
                href={`https://${user.website}`}
                target="_blank"
                rel="noreferrer"
              >
                {user.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function InfoTile({
  label,
  value,
  children,
}: {
  label: string;
  value: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/60">
        {children}
      </span>
      <div>
        <div className="text-xs text-slate-400 dark:text-slate-400">
          {label}
        </div>
        <div className="font-medium text-slate-800 dark:text-slate-100">
          {value}
        </div>
      </div>
    </div>
  );
}

function initialsFromName(name: string) {
  const parts = name?.trim().split(/\s+/) ?? [];
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

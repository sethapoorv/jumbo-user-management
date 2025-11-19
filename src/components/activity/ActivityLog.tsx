"use client";

import React, { useState } from "react";
import useAppStore, { ActivityLogEntry } from "@/app/stores/useAppStore";
import {
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

function formatTime(ts?: number) {
  return ts ? new Date(ts).toLocaleString() : "";
}

export default function ActivityLog() {
  // use the correct selector names from the store
  const logs = useAppStore((s) => s.activityLog ?? []);
  const clearLogs = useAppStore((s) => s.clearActivityLog);
  const [open, setOpen] = useState(true);

  return (
    <aside
      aria-label="Activity log"
      className={`fixed right-4 top-20 z-50 w-[320px] max-h-[70vh] rounded-lg shadow-lg overflow-hidden border bg-white dark:bg-slate-800 dark:border-slate-700`}
    >
      <div className="flex items-center justify-between p-3 border-b dark:border-slate-700">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">Activity</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {logs.length} item(s)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            title={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronUpIcon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => clearLogs()}
            title="Clear logs"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <TrashIcon className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="overflow-auto max-h-[60vh]">
          {logs.length === 0 ? (
            <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
              No activity yet.
            </div>
          ) : (
            <ul className="p-2 space-y-1">
              {logs.map((l: ActivityLogEntry) => (
                <li
                  key={l.id}
                  className="p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {l.message ?? l.type ?? "Activity"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(l.ts)}
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-700">
                        {l.type ?? "info"}
                      </span>
                    </div>
                  </div>

                  {l.meta && (
                    <pre className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                      {JSON.stringify(l.meta, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="p-3 text-sm text-slate-500 dark:text-slate-400">
          What have you been upto?
        </div>
      )}
    </aside>
  );
}

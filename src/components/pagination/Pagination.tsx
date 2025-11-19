// src/components/pagination/Pagination.tsx
"use client";

import React from "react";

type Props = {
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
  isFetching?: boolean;
  className?: string;
  siblingCount?: number; // how many page numbers to show on each side
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({
  page,
  setPage,
  totalPages,
  isFetching = false,
  className = "",
  siblingCount = 1,
}: Props) {
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(totalPages, page + 1));

  // build a small page list with siblings
  const start = Math.max(1, page - siblingCount);
  const end = Math.min(totalPages, page + siblingCount);
  const pages = range(start, end);

  return (
    <div
      className={[
        "flex items-center justify-between gap-4 px-4 py-3",
        "bg-transparent",
        className,
      ].join(" ")}
      aria-label="Table pagination"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={page <= 1}
          className="px-3 py-1 rounded-md border disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>

        <div className="flex items-center gap-1">
          {start > 1 && (
            <>
              <button
                onClick={() => setPage(1)}
                className="px-3 py-1 rounded-md border"
              >
                1
              </button>
              {start > 2 && <span className="px-2">…</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`px-3 py-1 rounded-md border ${
                p === page ? "bg-sky-600 text-white" : ""
              }`}
            >
              {p}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-2">…</span>}
              <button
                onClick={() => setPage(totalPages)}
                className="px-3 py-1 rounded-md border"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-xs">{isFetching ? "Updating…" : ""}</span>
        <button
          onClick={next}
          disabled={page >= totalPages}
          className="px-3 py-1 rounded-md border disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}

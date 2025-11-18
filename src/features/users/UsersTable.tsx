"use client";

import React, { useMemo, useState } from "react";
import { useUsers } from "@/hooks/userUsers";
import { ApiUser } from "@/types/user.types";

import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import {
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  CheckIcon,
  Cross2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

type Props = {
  isDark: boolean;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UsersTable({ isDark }: Props) {
  const { data: users, isLoading, isError, error } = useUsers();

  // UI state
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // table controls
  const [query, setQuery] = useState("");
  const [emailSort, setEmailSort] = useState<"asc" | "desc">("asc");
  const [companyFilter, setCompanyFilter] = useState<string>("All");

  if (isLoading)
    return (
      <div className={`p-6 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        Loading users…
      </div>
    );
  if (isError)
    return (
      <div className={`p-6 ${isDark ? "text-rose-300" : "text-rose-600"}`}>
        {`Error: ${error?.message}`}
      </div>
    );

  const openDeleteDialog = (id: number) => {
    setToDeleteId(id);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    alert(`Deleting user id ${toDeleteId} (implement mutation)`);
    setDialogOpen(false);
    setToDeleteId(null);
  };

  // Extracting the unique companies sorted alphabetically
  const companies = useMemo(() => {
    if (!users) return [];
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.company?.name) set.add(u.company.name);
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [users]);

  // Filter + sort users according to query, companyFilter, emailSort
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const q = query.trim().toLowerCase();

    let out = users.filter((u: ApiUser) => {
      const matchesName =
        u.name.toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q);
      const matchesCompany =
        companyFilter === "All" ||
        (u.company?.name ?? "").toLowerCase() === companyFilter.toLowerCase();
      return matchesName && matchesCompany;
    });

    out.sort((a, b) => {
      const aEmail = (a.email ?? "").toLowerCase();
      const bEmail = (b.email ?? "").toLowerCase();
      if (aEmail < bEmail) return emailSort === "asc" ? -1 : 1;
      if (aEmail > bEmail) return emailSort === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [users, query, companyFilter, emailSort]);

  // Styling tokens
  const containerBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-slate-200";
  const headerBg = isDark ? "bg-slate-900/40" : "bg-gray-50";
  const rowHover = isDark ? "hover:bg-slate-700" : "hover:bg-gray-50";
  const primaryText = isDark ? "text-slate-100" : "text-slate-900";
  const secondaryText = isDark ? "text-slate-400" : "text-slate-500";
  const mutedText = isDark ? "text-slate-300" : "text-slate-600";
  const dropdownBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-slate-200";
  const dialogBg = isDark ? "bg-slate-800" : "bg-white";
  const overlayBg = isDark ? "bg-black/70" : "bg-black/40";
  const controlBg = isDark ? "bg-slate-700/40" : "bg-white";

  return (
    <div className="p-6">
      {/* Controls: Search, Company Select, Sort */}
      <div
        className={`mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}
      >
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <div
            className={`relative flex items-center w-full ${controlBg} rounded-md border ${
              isDark ? "border-slate-700" : "border-slate-200"
            } px-3 py-2`}
          >
            <MagnifyingGlassIcon
              className={isDark ? "text-slate-300" : "text-slate-500"}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username..."
              className={`ml-3 w-full bg-transparent placeholder:${
                isDark ? "text-slate-400" : "text-slate-400"
              } focus:outline-none ${
                isDark ? "text-slate-100" : "text-slate-900"
              } text-sm`}
              aria-label="Search users by name"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className={`ml-2 text-xs ${
                  isDark ? "text-slate-300" : "text-slate-600"
                } hover:underline`}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Radix Select for company filter */}
          <Select.Root
            value={companyFilter}
            onValueChange={(v) => setCompanyFilter(v)}
          >
            <Select.Trigger
              aria-label="Filter by company"
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-slate-600"
                  : "border-slate-200 bg-white text-slate-700 focus:ring-slate-300"
              } `}
            >
              <Select.Value />
              <Select.Icon
                className={isDark ? "text-slate-200" : "text-slate-700"}
              >
                <ChevronDownIcon />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className={`min-w-[160px] rounded-md p-1 border ${dropdownBg}`}
                position="popper"
              >
                <Select.Viewport className="p-1">
                  {companies.map((c) => (
                    <Select.Item
                      key={c}
                      value={c}
                      className={`px-3 py-2 rounded flex items-center text-sm cursor-pointer select-none ${
                        isDark ? "text-slate-100" : "text-slate-700"
                      }`}
                    >
                      <Select.ItemText>{c}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          {/* Sort by email toggle */}
          <button
            onClick={() => setEmailSort((s) => (s === "asc" ? "desc" : "asc"))}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-slate-600"
                : "border-slate-200 bg-white text-slate-700 focus:ring-slate-300"
            }`}
            aria-pressed={emailSort === "desc"}
            aria-label={`Sort by email ${
              emailSort === "asc" ? "A to Z" : "Z to A"
            }`}
            title={`Sort by email (${emailSort === "asc" ? "A → Z" : "Z → A"})`}
          >
            <ChevronUpIcon
              className={`${
                isDark ? "text-slate-200" : "text-slate-700"
              } transition-transform duration-150 ${
                emailSort === "desc" ? "rotate-180" : ""
              }`}
            />
            <span className="text-sm">
              {emailSort === "asc" ? "Email A–Z" : "Email Z–A"}
            </span>
          </button>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border ${containerBg}`}>
        <table className="min-w-full divide-y">
          <thead className={`${headerBg}`}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <span className={primaryText}>Avatar</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <span className={primaryText}>Name</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <span className={primaryText}>Email</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <span className={primaryText}>Phone</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <span className={primaryText}>Company</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <span className={primaryText}>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="bg- divide-y">
            {filteredUsers.map((u: ApiUser) => (
              <tr key={u.id} className={`${rowHover}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Avatar.Root
                      className={`inline-flex items-center justify-center align-middle rounded-full overflow-hidden select-none h-10 w-10 ${
                        isDark ? "bg-indigo-500" : "bg-indigo-600"
                      }`}
                    >
                      <Avatar.Image
                        className="h-full w-full object-cover"
                        src={undefined}
                        alt={u.name}
                      />
                      <Avatar.Fallback
                        className="text-white font-semibold"
                        delayMs={600}
                      >
                        {initialsFromName(u.name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className={`font-medium ${primaryText}`}>{u.name}</div>
                  <div className={`text-xs ${secondaryText}`}>
                    {u.username ?? ""}
                  </div>
                </td>

                <td className={`px-4 py-3 text-sm ${mutedText}`}>{u.email}</td>

                <td className={`px-4 py-3 text-sm ${mutedText}`}>
                  {u.phone ?? "-"}
                </td>

                <td className={`px-4 py-3 text-sm ${mutedText}`}>
                  {u.company?.name ?? "-"}
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger
                        className={`inline-flex items-center justify-center p-2 rounded-md hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          isDark
                            ? "hover:bg-slate-700 focus:ring-slate-500"
                            : "hover:bg-gray-100 focus:ring-slate-300"
                        }`}
                        aria-label="Open actions"
                      >
                        <DotsHorizontalIcon
                          className={
                            isDark ? "text-slate-200" : "text-slate-700"
                          }
                        />
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Content
                        align="end"
                        sideOffset={6}
                        className={`min-w-[160px] rounded-md shadow-lg p-1 border ${dropdownBg}`}
                      >
                        <DropdownMenu.Item
                          className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-opacity-5 cursor-pointer rounded ${
                            isDark ? "hover:bg-slate-700" : "hover:bg-slate-50"
                          }`}
                          onSelect={() =>
                            alert(`Edit user ${u.id} (implement later)`)
                          }
                        >
                          <Pencil1Icon
                            className={`w-4 h-4 ${
                              isDark ? "text-slate-100" : "text-slate-700"
                            }`}
                          />
                          <span
                            className={
                              isDark ? "text-slate-100" : "text-slate-700"
                            }
                          >
                            Edit
                          </span>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-opacity-5 cursor-pointer rounded ${
                            isDark
                              ? "text-rose-300 hover:bg-slate-700"
                              : "text-rose-600 hover:bg-slate-50"
                          }`}
                          onSelect={() => openDeleteDialog(u.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className={`px-4 py-6 text-center text-sm ${mutedText}`}
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete via Radix Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={`fixed inset-0 ${overlayBg}`} />
          <Dialog.Content
            className={`fixed left-1/2 top-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 shadow-lg ${dialogBg} border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
            aria-describedby="delete-desc"
          >
            <Dialog.Title className={`text-lg font-semibold ${primaryText}`}>
              Delete user?
            </Dialog.Title>
            <Dialog.Description
              id="delete-desc"
              className={`mt-2 text-sm ${mutedText}`}
            >
              Are you sure you want to delete this user? This action cannot be
              undone.
            </Dialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${
                    isDark
                      ? "border-slate-700 bg-transparent text-slate-200 hover:bg-slate-700/60"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    isDark ? "focus:ring-slate-500" : "focus:ring-slate-300"
                  }`}
                >
                  <Cross2Icon className="w-4 h-4" /> Cancel
                </button>
              </Dialog.Close>

              <button
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-400"
              >
                <CheckIcon className="w-4 h-4" /> Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

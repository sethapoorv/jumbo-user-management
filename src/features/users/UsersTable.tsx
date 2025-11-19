"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";
import { useUsers } from "@/hooks/userUsers";
import UserFormDialog, { UserFormData } from "@/components/modal/ModalPopup";
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
import { PagedUsers } from "@/types/pagination";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { ApiUser } from "@/types/user.types";
import { USERS_QUERY_KEY_BASE } from "@/hooks/userUsers";
import { useRouter } from "next/navigation";
import useAppStore from "@/app/stores/useAppStore";

type Props = {
  isDark: boolean;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Reusable Pagination component
export function Pagination({
  page,
  totalPages,
  onChange,
  isDark,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  isDark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm">
        Page {page} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={`px-3 py-1 rounded-md text-sm border ${
            isDark
              ? "bg-slate-800 border-slate-700 text-slate-200 disabled:opacity-50"
              : "bg-white border-slate-200 text-slate-700 disabled:opacity-50"
          }`}
        >
          Prev
        </button>

        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={`px-3 py-1 rounded-md text-sm border ${
            isDark
              ? "bg-slate-800 border-slate-700 text-slate-200 disabled:opacity-50"
              : "bg-white border-slate-200 text-slate-700 disabled:opacity-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function UsersTable({ isDark }: Props) {
  // pagination
  const [page, setPage] = useState(1);
  const limit = 6; // change page size here

  // table controls
  const [query, setQuery] = useState("");
  const [emailSort, setEmailSort] = useState<"asc" | "desc">("asc");
  const [companyFilter, setCompanyFilter] = useState<string>("All");

  // UI state
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add / edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);

  // React Query + data
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useUsers(page, limit);

  // normalize current page list
  const list: ApiUser[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? list.length;
  const router = useRouter();

  //Maintaining Logs
  const addActivityLog = useAppStore((s) => s.addActivityLog);

  // Mutations
  // Delete mutation (optimistic)
  const deleteUserMutation = useMutation<
    void,
    Error,
    number,
    { previous?: PagedUsers | undefined; deletedUserName?: string }
  >({
    mutationFn: async (id: number) => {
      await axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`);
    },

    // optimistic update + optimistic log
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: [USERS_QUERY_KEY_BASE] });

      const previous = queryClient.getQueryData<PagedUsers | undefined>([
        USERS_QUERY_KEY_BASE,
        page,
        limit,
      ]);

      // try to find the user name from current cache so we can log a friendly message
      const deletedUserName =
        previous?.items.find((u) => u.id === id)?.name ?? `id:${id}`;

      // optimistic update of UI
      queryClient.setQueryData<PagedUsers | undefined>(
        [USERS_QUERY_KEY_BASE, page, limit],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((u) => u.id !== id),
            total: Math.max(0, old.total - 1),
          };
        }
      );

      // optimistic activity log (instant feedback)
      try {
        addActivityLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: "user-deleted",
          message: `Deleted user ${deletedUserName}`,
          ts: Date.now(),
          meta: { id },
        });
      } catch (e) {
        // don't block UX if logging fails
        console.warn("Failed to add optimistic log", e);
      }

      return { previous, deletedUserName };
    },

    onError: (err, id, context) => {
      // rollback the optimistic update if error
      if (context?.previous) {
        queryClient.setQueryData(
          [USERS_QUERY_KEY_BASE, page, limit],
          context.previous
        );
      }

      // error log
      try {
        addActivityLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: "user-deleted-failed",
          message: `Failed deleting user ${context?.deletedUserName ?? id}`,
          ts: Date.now(),
          meta: { id, error: String(err) },
        });
      } catch {}
    },

    onSuccess: (_data, id, context) => {
      // confirmed log
      try {
        addActivityLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: "user-deleted-confirmed",
          message: `Confirmed deletion of ${
            context?.deletedUserName ?? `id:${id}`
          }`,
          ts: Date.now(),
          meta: { id },
        });
      } catch {}
    },
  });

  // save (create/edit) mutation (optimistic) — with activity log
  const saveUserMutation = useMutation<
    ApiUser,
    Error,
    UserFormData,
    {
      previous?: PagedUsers | undefined;
      tempId?: number;
      optimisticName?: string;
    }
  >({
    mutationFn: async (payload: UserFormData) => {
      if (payload.id) {
        const res = await axios.put<ApiUser>(
          `https://jsonplaceholder.typicode.com/users/${payload.id}`,
          payload
        );
        return res.data;
      } else {
        const res = await axios.post<ApiUser>(
          "https://jsonplaceholder.typicode.com/users",
          payload
        );
        return res.data;
      }
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [USERS_QUERY_KEY_BASE] });

      const previous = queryClient.getQueryData<PagedUsers | undefined>([
        USERS_QUERY_KEY_BASE,
        page,
        limit,
      ]);

      const tempId = payload.id ?? Date.now();

      const optimistic: ApiUser = {
        id: tempId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? "",
        company: { name: payload.company ?? "" } as any,
        username: payload.email?.split("@")[0] ?? "",
      } as ApiUser;

      // update cache optimistically
      queryClient.setQueryData<PagedUsers | undefined>(
        [USERS_QUERY_KEY_BASE, page, limit],
        (old) => {
          if (!old) {
            return { items: [optimistic], total: 1, totalPages: 1 };
          }

          if (payload.id) {
            // edit: update in place
            return {
              ...old,
              items: old.items.map((u) =>
                u.id === payload.id ? { ...u, ...optimistic } : u
              ),
            };
          }

          // create user
          const newItems = [optimistic, ...old.items].slice(0, limit);
          return {
            ...old,
            items: newItems,
            total: old.total + 1,
            totalPages: Math.max(
              old.totalPages,
              Math.ceil((old.total + 1) / limit)
            ),
          };
        }
      );

      // optimistic log
      try {
        addActivityLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: payload.id ? "user-edited" : "user-added",
          message: payload.id
            ? `Edited user ${payload.name}`
            : `Created user ${payload.name}`,
          ts: Date.now(),
          meta: { tempId, email: payload.email },
        });
      } catch (e) {
        // non-blocking
        console.warn("Activity log failed (optimistic)", e);
      }

      return { previous, tempId, optimisticName: payload.name };
    },

    onError: (err, payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [USERS_QUERY_KEY_BASE, page, limit],
          context.previous
        );
      }

      // error log
      try {
        addActivityLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: payload.id ? "user-edit-failed" : "user-create-failed",
          message: `${payload.id ? "Edit" : "Create"} failed for ${
            context?.optimisticName ?? payload.name
          }`,
          ts: Date.now(),
          meta: { error: String(err) },
        });
      } catch {}
    },

    onSuccess: (dataFromServer: ApiUser, variables, context) => {
      const tempId = context?.tempId;

      queryClient.setQueryData<PagedUsers | undefined>(
        [USERS_QUERY_KEY_BASE, page, limit],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((u) =>
              u.id === (variables.id ?? tempId)
                ? { ...u, ...dataFromServer }
                : u
            ),
          };
        }
      );

      // confirmed log
      try {
        addActivityLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: variables.id ? "user-edited-confirmed" : "user-added-confirmed",
          message: variables.id
            ? `Confirmed edit: ${dataFromServer.name}`
            : `Confirmed create: ${dataFromServer.name}`,
          ts: Date.now(),
          meta: { id: dataFromServer.id, email: dataFromServer.email },
        });
      } catch (e) {
        console.warn("Activity log failed (confirmed)", e);
      }
    },
  });

  const companies = useMemo(() => {
    const set = new Set<string>();
    list.forEach((u) => {
      if (u.company?.name) set.add(u.company.name);
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [list]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = list.filter((u) => {
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
  }, [list, query, companyFilter, emailSort]);

  // UI functions
  const openDeleteDialog = (id: number) => {
    setToDeleteId(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (toDeleteId == null) {
      setDialogOpen(false);
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(toDeleteId);
      setDialogOpen(false);
      setToDeleteId(null);
    } catch (err) {
      console.error("Delete failed", err);
      setDialogOpen(false);
      setToDeleteId(null);
    }
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEditClick = (u: ApiUser) => {
    setEditingUser({
      id: u.id,
      name: u.name,
      email: u.email ?? "",
      phone: u.phone ?? "",
      company: u.company?.name ?? "",
    });
    setFormOpen(true);
  };

  const handleFormSubmit = async (dataPayload: UserFormData) => {
    try {
      await saveUserMutation.mutateAsync(dataPayload);
      setFormOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  // styling tokens
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

  if (isLoading)
    return (
      <div className={`p-6 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        Loading users…
      </div>
    );
  if (isError)
    return (
      <div
        className={`p-6 ${isDark ? "text-rose-300" : "text-rose-600"}`}
      >{`Error: ${error?.message}`}</div>
    );

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border bg-sky-600 text-white hover:bg-sky-500"
            aria-label="Add user"
          >
            Add User
          </button>

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
              }`}
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

      {/* Table */}
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
            {filteredUsers.map((u) => (
              <tr
                key={u.id ?? Math.random()}
                className={`${rowHover} cursor-pointer`}
                onClick={() => {
                  if (u?.id == null) {
                    console.warn("Row clicked but id missing", u);
                    return;
                  }
                  router.push(`/users/${encodeURIComponent(String(u.id))}`);
                }}
              >
                {/* Avatar */}
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Avatar.Root
                      className={`inline-flex items-center justify-center align-middle rounded-full overflow-hidden h-10 w-10 ${
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

                {/* Name */}
                <td className="px-4 py-3 text-sm">
                  <div className={`font-medium ${primaryText}`}>{u.name}</div>
                  <div className={`text-xs ${secondaryText}`}>
                    {u.username ?? ""}
                  </div>
                </td>

                {/* Email */}
                <td className={`px-4 py-3 text-sm ${mutedText}`}>{u.email}</td>

                {/* Phone */}
                <td className={`px-4 py-3 text-sm ${mutedText}`}>
                  {u.phone ?? "-"}
                </td>

                {/* Company */}
                <td className={`px-4 py-3 text-sm ${mutedText}`}>
                  {u.company?.name ?? "-"}
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger
                        onClick={(e) => e.stopPropagation()}
                        className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(u);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded ${
                            isDark ? "hover:bg-slate-700" : "hover:bg-slate-50"
                          }`}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(u.id);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded ${
                            isDark
                              ? "text-rose-300 hover:bg-slate-700"
                              : "text-rose-600 hover:bg-slate-50"
                          }`}
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

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => setPage(p)}
        isDark={isDark}
      />

      {/* Delete dialog */}
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

      {/* User form dialog */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingUser(null);
        }}
        initialData={editingUser}
        onSubmit={handleFormSubmit}
        isDark={isDark}
        title={editingUser ? "Edit user" : "Add user"}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useUsers } from "@/hooks/userUsers";
import { ApiUser } from "@/types/user.types";

import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UsersTable() {
  const { data: users, isLoading, isError, error } = useUsers();
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) return <div className="p-6">Loading users…</div>;
  if (isError)
    return <div className="p-6 text-red-500">Error: {error?.message}</div>;

  const openDeleteDialog = (id: number) => {
    setToDeleteId(id);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    alert(`Deleting user id ${toDeleteId} (implement mutation)`);
    setDialogOpen(false);
    setToDeleteId(null);
  };

  return (
    <div className="p-6">
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Avatar
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Company
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg- divide-y">
            {users?.map((u: ApiUser) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Avatar.Root className="inline-flex items-center justify-center align-middle rounded-full overflow-hidden select-none h-10 w-10 bg-indigo-600">
                      <Avatar.Image
                        className="h-full w-full object-cover"
                        src={undefined}
                        alt={u.name}
                      />
                      <Avatar.Fallback className="text-white font-semibold">
                        {initialsFromName(u.name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">
                    {u.username ?? ""}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">{u.email}</td>

                <td className="px-4 py-3 text-sm">{u.phone ?? "-"}</td>

                <td className="px-4 py-3 text-sm">{u.company?.name ?? "-"}</td>

                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                        aria-label="Open actions"
                      >
                        <DotsHorizontalIcon />
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Content
                        align="end"
                        sideOffset={6}
                        className="min-w-[160px] rounded-md bg-white shadow-lg p-1 border"
                      >
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer rounded"
                          onSelect={() =>
                            alert(`Edit user ${u.id} (implement later)`)
                          }
                        >
                          <Pencil1Icon className="w-4 h-4" />
                          Edit
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer rounded text-rose-600"
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

            {users && users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete via Radix Box */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold">
              Delete user?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </Dialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50">
                  <Cross2Icon className="w-4 h-4" /> Cancel
                </button>
              </Dialog.Close>

              <button
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-500"
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

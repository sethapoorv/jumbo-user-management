"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export type UserFormData = {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: UserFormData | null;
  onSubmit: (data: UserFormData) => Promise<void> | void;
  isDark?: boolean;
  title?: string;
};

export default function UserFormDialog({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  isDark = false,
  title = "Add / Edit user",
}: Props) {
  const [form, setForm] = useState<UserFormData>(
    initialData ?? { name: "", email: "", phone: "", company: "" }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
    if (!initialData) setForm({ name: "", email: "", phone: "", company: "" });
  }, [initialData, open]);

  const handleChange =
    (key: keyof UserFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(form);
      setSubmitting(false);
      onOpenChange(false);
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message ?? "Failed to submit");
    }
  };

  // styling tokens (dark / light aware)
  const dialogBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-slate-200";
  const overlayBg = isDark ? "bg-black/70" : "bg-black/40";
  const titleText = isDark ? "text-slate-100" : "text-slate-900";
  const descText = isDark ? "text-slate-300" : "text-slate-600";
  const inputBase = `w-full rounded-md border px-3 py-2 text-sm focus:outline-none`;
  const inputLight = `bg-white border-slate-200 text-slate-900 placeholder:text-slate-400`;
  const inputDark = `bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400`;

  const cancelBtnLight =
    "inline-flex items-center gap-2 px-3 py-2 rounded-md border text-rose-600 hover:bg-rose-50";
  const cancelBtnDark =
    "inline-flex items-center gap-2 px-3 py-2 rounded-md border text-rose-300 hover:bg-rose-900/20";

  const saveBtn =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white text-sm disabled:opacity-60";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={`fixed inset-0 ${overlayBg}`} />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 shadow-lg border ${dialogBg}`}
          aria-describedby="user-form-desc"
        >
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className={`text-lg font-semibold ${titleText}`}>
                {title}
              </Dialog.Title>
              <Dialog.Description
                id="user-form-desc"
                className={`mt-1 text-sm ${descText}`}
              >
                Add or edit user details. Name and Email are required.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Name</label>
              <input
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Full name"
                className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                aria-required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                value={form.email}
                onChange={handleChange("email")}
                placeholder="name@example.com"
                type="email"
                className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                aria-required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="Optional"
                className={`${inputBase} ${isDark ? inputDark : inputLight}`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Company</label>
              <input
                value={form.company}
                onChange={handleChange("company")}
                placeholder="Optional"
                className={`${inputBase} ${isDark ? inputDark : inputLight}`}
              />
            </div>

            {error && <div className="text-sm text-rose-500">{error}</div>}

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={isDark ? cancelBtnDark : cancelBtnLight}
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button type="submit" disabled={submitting} className={saveBtn}>
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

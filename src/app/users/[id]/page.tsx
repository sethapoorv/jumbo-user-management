import React from "react";
import UserDetailClient from "@/components/users/UserDetail";

type Props = {
  params?: { id?: string } | Promise<{ id?: string }>;
};

export default async function Page({ params }: Props) {
  const resolved = params ? await params : undefined;
  const id = resolved?.id;

  if (!id || id === "undefined") {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg border p-6 bg-yellow-50 text-yellow-800">
            Invalid user id — return to the users list and pick a user.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <UserDetailClient id={id} />
      </div>
    </main>
  );
}

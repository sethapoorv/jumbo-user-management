// src/services/users.service.ts
import axios from "axios";
import type { ApiUser } from "@/types/user.types";
import type { PagedUsers } from "@/types/pagination";

export async function getUsers(page = 1, limit = 10): Promise<PagedUsers> {
  const res = await axios.get<ApiUser[]>(
    "https://jsonplaceholder.typicode.com/users"
  );
  const all = res.data || [];

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);

  return { items, total, totalPages };
}

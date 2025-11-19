import type { ApiUser } from "@/types/user.types";

export type PagedUsers = {
  items: ApiUser[];
  total: number;
  totalPages: number;
};

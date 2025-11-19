"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { getUsers } from "@/services/users.service";
import type { PagedUsers } from "@/types/pagination";

export const USERS_QUERY_KEY_BASE = "users" as const;

export function useUsers(
  page = 1,
  limit = 10
): UseQueryResult<PagedUsers, Error> {
  return useQuery({
    queryKey: [USERS_QUERY_KEY_BASE, page, limit] as const,
    queryFn: () => getUsers(page, limit),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

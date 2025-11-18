"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/users.service";
import { ApiUser } from "@/types/user.types";

export const USERS_QUERY_KEY = ["users"];

export function useUsers() {
  return useQuery<ApiUser[], Error>({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsers,
    staleTime: 1000 * 60 * 2,
  });
}

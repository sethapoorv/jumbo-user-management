import axios from "axios";
import { ApiUser } from "@/types/user.types";

const API_BASE = "https://jsonplaceholder.typicode.com";

export const getUsers = async (): Promise<ApiUser[]> => {
  const res = await axios.get<ApiUser[]>(`${API_BASE}/users`);
  return res.data;
};

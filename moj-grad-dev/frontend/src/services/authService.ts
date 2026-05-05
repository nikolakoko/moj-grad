import { apiClient } from "../lib/apiClient";

export const login = (data: { email: string; password: string }) => {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
// account.ts
import { apiClient } from "./client";
import { useAuthStore } from "../store/authStore";
import type { User } from "./auth"; // adjust path if User is defined elsewhere

function getToken() {
  return useAuthStore.getState().accessToken || "";
}

export async function fetchMe() {
  return apiClient<{ user: User }>("/account/me", {
    method: "GET",
    token: getToken(),
  });
}

export async function updateProfile(data: { name?: string; email?: string }) {
  return apiClient<{ user: User }>("/account/profile", {
    method: "PUT",
    body: JSON.stringify(data),
    token: getToken(),
  });
}

export async function topUp(amount: number) {
  return apiClient<{ balance: number }>("/wallet/topup", {
    method: "POST",
    body: JSON.stringify({ amount }),
    token: getToken(),
  });
}
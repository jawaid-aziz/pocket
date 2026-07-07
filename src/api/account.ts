// account.ts
import { apiClient } from "./client";
import { useAuthStore } from "../store/authStore";

function getToken() {
  return useAuthStore.getState().accessToken || "";
}

export interface AccountUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  balance: number;
}

export async function fetchMe() {
  return apiClient<{ user: AccountUser }>("/account/me", {
    method: "GET",
    token: getToken(),
  });
}

export async function updateProfile(data: { name?: string; email?: string }) {
  // This endpoint returns the plain User shape (no balance) — different from fetchMe
  return apiClient<{ user: { id: string; phone: string; name: string | null; email: string | null } }>(
    "/account/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
      token: getToken(),
    }
  );
}

export async function topUp(amount: number) {
  return apiClient<{ clientSecret: string; paymentIntentId: string }>("/wallet/topup", {
    method: "POST",
    body: JSON.stringify({ amount }),
    token: getToken(),
  });
}
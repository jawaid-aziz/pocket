import { apiClient } from "./client";
import { useAuthStore } from "../store/authStore";

function getToken() {
  return useAuthStore.getState().accessToken || "";
}

export async function fetchMe() {
  return apiClient<any>("/account/me", {
    method: "GET",
    token: getToken(),
  });
}

export async function updateProfile(data: { name?: string; email?: string }) {
  return apiClient<any>("/account/profile", {
    method: "PUT",
    body: JSON.stringify(data),
    token: getToken(),
  });
}

export async function topUp(amount: number) {
  return apiClient<any>("/wallet/topup", {
    method: "POST",
    body: JSON.stringify({ amount }),
    token: getToken(),
  });
}
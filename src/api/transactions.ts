import { apiClient } from "./client";
import { useAuthStore } from "../store/authStore";

function getToken() {
  return useAuthStore.getState().accessToken || "";
}

export interface Transaction {
  id: string;
  type: "TOPUP" | "TRANSFER_SENT" | "TRANSFER_RECEIVED";
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
  counterpartWallet?: {
    user: { phone: string; name: string | null };
  } | null;
}

export async function sendMoney(params: {
  recipientPhone: string;
  amount: number;
  description?: string;
}) {
  return apiClient<{
    message: string;
    balance: number;
    recipient: { phone: string; name: string | null };
    amount: number;
  }>("/transactions/send", {
    method: "POST",
    body: JSON.stringify(params),
    token: getToken(),
  });
}

export async function fetchTransactions() {
  return apiClient<{ transactions: Transaction[] }>("/transactions", {
    method: "GET",
    token: getToken(),
  });
}
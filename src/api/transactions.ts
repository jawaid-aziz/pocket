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

export interface TransactionsPage {
  transactions: Transaction[];
  hasMore: boolean;
  nextCursor: string | null;
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
    transaction: Transaction | null;
  }>("/transactions/send", {
    method: "POST",
    body: JSON.stringify(params),
    token: getToken(),
  });
}

export async function fetchTransactions(opts?: {
  limit?: number;
  cursor?: string;
}) {
  const query = new URLSearchParams();
  if (opts?.limit) query.set("limit", String(opts.limit));
  if (opts?.cursor) query.set("cursor", opts.cursor);
  const qs = query.toString();
  return apiClient<TransactionsPage>(`/transactions${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: getToken(),
  });
}
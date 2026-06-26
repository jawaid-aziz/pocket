import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMoney, fetchTransactions } from "../transactions";
import { useWalletStore } from "@/src/store/walletStore";
import { useAuthStore } from "@/src/store/authStore";

export function useTransactions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const data = await fetchTransactions();
      return data.transactions;
    },
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useSendMoney() {
  const qc = useQueryClient();
  const setBalance = useWalletStore((s) => s.setBalance);
  return useMutation({
    mutationFn: sendMoney,
    onSuccess: (data) => {
      setBalance(Number(data.balance));
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
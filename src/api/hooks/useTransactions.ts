import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
import {
  sendMoney,
  fetchTransactions,
  TransactionsPage,
  Transaction,
} from "../transactions";
import { useWalletStore } from "@/src/store/walletStore";
import { useAuthStore } from "@/src/store/authStore";

function txKey(userId?: string) {
  return ["transactions", userId];
}

export function useTransactions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    // Scoped by user id so a quick logout → login can't surface the previous
    // user's cached transactions.
    queryKey: txKey(userId),
    queryFn: async () => {
      const data = await fetchTransactions({ limit: 50 });
      return data.transactions;
    },
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useTransactionsFeed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  return useInfiniteQuery<TransactionsPage>({
    queryKey: [...txKey(userId), "feed"],
    queryFn: ({ pageParam }) =>
      fetchTransactions({ limit: 20, cursor: (pageParam as string) || undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useSendMoney() {
  const qc = useQueryClient();
  const setBalance = useWalletStore((s) => s.setBalance);
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: sendMoney,
    onSuccess: (data) => {
      setBalance(Number(data.balance));
      // Optimistically prepend the sender's ledger entry so the history
      // updates instantly instead of after a refetch.
      if (data.transaction) {
        qc.setQueryData<Transaction[]>(txKey(userId), (old) =>
          [data.transaction as Transaction, ...(old ?? [])],
        );
        qc.setQueryData<InfiniteData<TransactionsPage>>(
          [...txKey(userId), "feed"],
          (old) => {
            if (!old) return old;
            const firstPage = old.pages[0];
            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  transactions: [
                    data.transaction as Transaction,
                    ...firstPage.transactions,
                  ],
                },
                ...old.pages.slice(1),
              ],
            };
          },
        );
      }
      qc.invalidateQueries({ queryKey: txKey(userId) });
    },
  });
}
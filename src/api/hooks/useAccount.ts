import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMe, updateProfile, topUp } from "../account";
import { useWalletStore } from "@/src/store/walletStore";
import { useAuthStore } from "@/src/store/authStore";

// useAccount.ts — fix useMe
export function useMe() {
  const setBalance = useWalletStore((s) => s.setBalance);
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await fetchMe();
      const { balance, ...user } = data.user;
      setBalance(Number(balance));
      setSession(user, accessToken!);
      return data.user;
    },
    staleTime: 30_000,
    enabled: !!accessToken && isAuthenticated,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useTopUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: topUp,
    // No setBalance here — topUp only returns a clientSecret.
    // The wallet is credited later, asynchronously, when Stripe's webhook fires.
    // We invalidate "me" here as a safety net (e.g. if the user navigates back
    // to the dashboard before load.tsx's own invalidate+refetch finishes).
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
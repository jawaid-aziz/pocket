import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMe, updateProfile, topUp } from "../account";
import { useWalletStore } from "@/src/store/walletStore";
import { useAuthStore } from "@/src/store/authStore";

export function useMe() {
  const setBalance = useWalletStore((s) => s.setBalance);
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await fetchMe();
      const user = data.user;
      setBalance(Number(user.balance));
      setSession(user, accessToken!);
      return user;
    },
    staleTime: 30_000,
    enabled: !!accessToken && isAuthenticated, // ← add this
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
  const setBalance = useWalletStore((s) => s.setBalance);
  return useMutation({
    mutationFn: topUp,
    onSuccess: (data) => {
      setBalance(Number(data.balance));
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
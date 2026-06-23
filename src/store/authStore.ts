import { create } from "zustand";
import { User } from "../api/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isUnlocked: boolean; // true after PIN/biometric on app open
  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setUnlocked: (value: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isUnlocked: false,
  setSession: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isUnlocked: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUnlocked: (value) => set({ isUnlocked: value }),
  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isUnlocked: false,
    }),
}));

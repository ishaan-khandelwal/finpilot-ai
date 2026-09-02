import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, BusinessSummary } from "@/types/user";

interface AuthStore {
  user: User | null;
  business: BusinessSummary | null;
  access_token: string | null;
  refresh_token: string | null;
  is_authenticated: boolean;

  setAuth: (user: User, business: BusinessSummary | null, access_token: string, refresh_token: string) => void;
  setTokens: (access_token: string, refresh_token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

function syncCookie(isAuthenticated: boolean) {
  if (typeof document !== "undefined") {
    if (isAuthenticated) {
      document.cookie = `finpilot-auth=1; path=/; max-age=604800; SameSite=Lax`;
    } else {
      document.cookie = `finpilot-auth=; path=/; max-age=0; SameSite=Lax`;
    }
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      business: null,
      access_token: null,
      refresh_token: null,
      is_authenticated: false,

      setAuth: (user, business, access_token, refresh_token) => {
        syncCookie(true);
        set({ user, business, access_token, refresh_token, is_authenticated: true });
      },

      setTokens: (access_token, refresh_token) =>
        set({ access_token, refresh_token }),

      updateUser: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),

      logout: () => {
        syncCookie(false);
        set({ user: null, business: null, access_token: null, refresh_token: null, is_authenticated: false });
      },
    }),
    {
      name: "finpilot-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.is_authenticated) {
          syncCookie(true);
        }
      },
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        is_authenticated: state.is_authenticated,
      }),
    }
  )
);

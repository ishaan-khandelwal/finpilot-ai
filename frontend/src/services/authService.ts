import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials, RegisterCredentials, TokenResponse } from "@/types/user";
import { API_ROUTES } from "@/constants/routes";

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>(API_ROUTES.AUTH.LOGIN, credentials);
    useAuthStore.getState().setAuth(data.user, data.business, data.access_token, data.refresh_token);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>(API_ROUTES.AUTH.REGISTER, credentials);
    useAuthStore.getState().setAuth(data.user, data.business, data.access_token, data.refresh_token);
    return data;
  },

  async logout(): Promise<void> {
    const { refresh_token } = useAuthStore.getState();
    try {
      if (refresh_token) {
        await api.post(API_ROUTES.AUTH.LOGOUT, { refresh_token });
      }
    } finally {
      useAuthStore.getState().logout();
    }
  },

  async getMe() {
    const { data } = await api.get(API_ROUTES.AUTH.ME);
    useAuthStore.getState().updateUser(data);
    return data;
  },
};

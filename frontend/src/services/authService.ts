import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials, RegisterCredentials, TokenResponse } from "@/types/user";
import { API_ROUTES } from "@/constants/routes";

const DEMO_TOKEN_RESPONSE: TokenResponse = {
  access_token: "demo-jwt-access-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  refresh_token: "demo-refresh-token-valid",
  token_type: "bearer",
  expires_in: 86400,
  user: {
    id: "99999999-9999-9999-9999-999999999999",
    email: "demo@finpilot.ai",
    full_name: "Riya Sharma",
    role: "owner",
    is_active: true,
    is_verified: true,
    last_login_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  business: {
    id: "88888888-8888-8888-8888-888888888888",
    name: "FinPilot Technologies Pvt Ltd",
    gstin: "27AAACF1234M1Z2",
  },
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    // If demo account credentials used directly
    if (credentials.email === "demo@finpilot.ai" && credentials.password === "Demo@12345") {
      useAuthStore.getState().setAuth(
        DEMO_TOKEN_RESPONSE.user,
        DEMO_TOKEN_RESPONSE.business,
        DEMO_TOKEN_RESPONSE.access_token,
        DEMO_TOKEN_RESPONSE.refresh_token
      );
      return DEMO_TOKEN_RESPONSE;
    }

    try {
      const { data } = await api.post<TokenResponse>(API_ROUTES.AUTH.LOGIN, credentials);
      useAuthStore.getState().setAuth(data.user, data.business, data.access_token, data.refresh_token);
      return data;
    } catch (err: any) {
      // If backend is unreachable (e.g. connection refused) or server error during development, fallback gracefully if demo mode
      if (!err.response && (credentials.email.includes("demo") || credentials.password.includes("Demo"))) {
        useAuthStore.getState().setAuth(
          DEMO_TOKEN_RESPONSE.user,
          DEMO_TOKEN_RESPONSE.business,
          DEMO_TOKEN_RESPONSE.access_token,
          DEMO_TOKEN_RESPONSE.refresh_token
        );
        return DEMO_TOKEN_RESPONSE;
      }
      throw err;
    }
  },

  async loginWithDemo(): Promise<TokenResponse> {
    useAuthStore.getState().setAuth(
      DEMO_TOKEN_RESPONSE.user,
      DEMO_TOKEN_RESPONSE.business,
      DEMO_TOKEN_RESPONSE.access_token,
      DEMO_TOKEN_RESPONSE.refresh_token
    );
    return DEMO_TOKEN_RESPONSE;
  },

  async register(credentials: RegisterCredentials): Promise<TokenResponse> {
    try {
      const { data } = await api.post<TokenResponse>(API_ROUTES.AUTH.REGISTER, credentials);
      useAuthStore.getState().setAuth(data.user, data.business, data.access_token, data.refresh_token);
      return data;
    } catch (err: any) {
      // Graceful local handling if backend is offline during frontend design review
      if (!err.response) {
        const fallbackUser = {
          id: "11111111-1111-1111-1111-111111111111",
          email: credentials.email,
          full_name: credentials.full_name,
          role: "owner" as const,
          is_active: true,
          is_verified: true,
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        const fallbackBusiness = {
          id: "22222222-2222-2222-2222-222222222222",
          name: credentials.business_name,
          gstin: credentials.gstin || null,
        };
        useAuthStore.getState().setAuth(
          fallbackUser,
          fallbackBusiness,
          DEMO_TOKEN_RESPONSE.access_token,
          DEMO_TOKEN_RESPONSE.refresh_token
        );
        return {
          ...DEMO_TOKEN_RESPONSE,
          user: fallbackUser,
          business: fallbackBusiness,
        };
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    const { refresh_token } = useAuthStore.getState();
    try {
      if (refresh_token && !refresh_token.startsWith("demo-")) {
        await api.post(API_ROUTES.AUTH.LOGOUT, { refresh_token });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      useAuthStore.getState().logout();
    }
  },

  async getMe() {
    try {
      const { data } = await api.get(API_ROUTES.AUTH.ME);
      useAuthStore.getState().updateUser(data);
      return data;
    } catch (err) {
      const current = useAuthStore.getState().user;
      if (current) return current;
      throw err;
    }
  },
};

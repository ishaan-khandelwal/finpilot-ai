export type UserRole = "owner" | "accountant" | "viewer";

export interface BusinessSummary {
  id: string;
  name: string;
  gstin: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  business: BusinessSummary | null;
  access_token: string | null;
  refresh_token: string | null;
  is_authenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  business_name: string;
  gstin?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  business: BusinessSummary | null;
}

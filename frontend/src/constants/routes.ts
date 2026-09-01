export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  INVOICES: "/invoices",
  TRANSACTIONS: "/transactions",
  RECONCILIATION: "/reconciliation",
  FORECASTS: "/forecasts",
  COPILOT: "/copilot",
  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    REFRESH: "/api/v1/auth/refresh",
    LOGOUT: "/api/v1/auth/logout",
    ME: "/api/v1/auth/me",
  },
  BUSINESSES: {
    ME: "/api/v1/businesses/me",
  },
  DOCUMENTS: {
    BASE: "/api/v1/documents",
    UPLOAD: "/api/v1/documents/upload",
  },
  INVOICES: {
    BASE: "/api/v1/invoices",
    STATS: "/api/v1/invoices/stats",
  },
  TRANSACTIONS: {
    BASE: "/api/v1/transactions",
    STATS: "/api/v1/transactions/stats",
  },
  RECONCILIATION: {
    RUN: "/api/v1/reconciliation/run",
    MATCHES: "/api/v1/reconciliation/matches",
    EXCEPTIONS: "/api/v1/reconciliation/exceptions",
    STATUS: "/api/v1/reconciliation/status",
  },
  FORECASTS: {
    BASE: "/api/v1/forecasts",
    GENERATE: "/api/v1/forecasts/generate",
    LATEST: "/api/v1/forecasts/latest",
  },
  CHAT: {
    CONVERSATIONS: "/api/v1/chat/conversations",
    WS: (conversationId: string) => `/api/v1/chat/ws/${conversationId}`,
  },
  REPORTS: {
    BASE: "/api/v1/reports",
    GENERATE: "/api/v1/reports/generate",
  },
  DASHBOARD: {
    OVERVIEW: "/api/v1/dashboard/overview",
    CASH_FLOW: "/api/v1/dashboard/cash-flow",
  },
} as const;

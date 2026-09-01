import api from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { CashFlowPeriod, CashFlowResponse, DashboardOverview } from "@/types/dashboard";

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>(API_ROUTES.DASHBOARD.OVERVIEW);
    return data;
  },

  async getCashFlow(days: CashFlowPeriod): Promise<CashFlowResponse> {
    const { data } = await api.get<CashFlowResponse>(API_ROUTES.DASHBOARD.CASH_FLOW, {
      params: { days },
    });
    return data;
  },
};

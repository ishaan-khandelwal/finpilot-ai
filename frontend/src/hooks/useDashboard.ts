import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import type { CashFlowPeriod } from "@/types/dashboard";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getOverview,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    staleTime: 2 * 60 * 1000,
  });
}

export function useCashFlow(initialPeriod: CashFlowPeriod = 30) {
  const [period, setPeriod] = useState<CashFlowPeriod>(initialPeriod);

  const query = useQuery({
    queryKey: ["dashboard", "cash-flow", period],
    queryFn: () => dashboardService.getCashFlow(period),
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, period, setPeriod };
}

"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Sparkles, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

interface ForecastPoint {
  date: string;
  predicted_inflow: number;
  predicted_outflow: number;
  predicted_balance: number;
  confidence_lower: number;
  confidence_upper: number;
}

interface Forecast {
  id: string;
  forecast_date: string;
  horizon_days: number;
  model_type: string;
  points: ForecastPoint[];
  summary: string | null;
  accuracy_mape: number | null;
}

export default function ForecastsPage() {
  const qc = useQueryClient();

  const { data: forecast, isLoading } = useQuery({
    queryKey: ["forecasts", "latest"],
    queryFn: async () => {
      const { data } = await api.get<Forecast>(API_ROUTES.FORECASTS.LATEST);
      return data;
    },
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(API_ROUTES.FORECASTS.GENERATE, { horizon_days: 90 });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forecasts"] }),
  });

  const lastPoint = forecast?.points[forecast.points.length - 1];
  const firstPoint = forecast?.points[0];
  const balanceDelta = lastPoint && firstPoint
    ? lastPoint.predicted_balance - firstPoint.predicted_balance
    : null;

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Cash Flow Forecast" description="AI-powered 90-day prediction" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {forecast ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold currency-font text-foreground">
                    {formatCurrency(lastPoint?.predicted_balance ?? 0)}
                  </p>
                  {balanceDelta !== null && (
                    <span className={cn("flex items-center gap-1 text-sm font-medium",
                      balanceDelta >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {balanceDelta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {balanceDelta >= 0 ? "+" : ""}{formatCurrency(balanceDelta)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Predicted balance in {forecast.horizon_days} days · Generated {formatDate(forecast.forecast_date)}
                </p>
                {forecast.accuracy_mape !== null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Model accuracy: <span className="text-primary font-medium">{(100 - forecast.accuracy_mape).toFixed(1)}%</span>
                  </p>
                )}
              </>
            ) : (
              <div>
                <p className="text-lg font-medium text-muted-foreground">No forecast generated yet</p>
                <p className="text-sm text-muted-foreground mt-1">Generate your first forecast to see 90-day predictions</p>
              </div>
            )}
          </div>

          <Button
            id="generate-forecast"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="gap-2 shrink-0"
          >
            {generateMutation.isPending
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4" />
            }
            {generateMutation.isPending ? "Generating…" : "Generate Forecast"}
          </Button>
        </div>

        {/* Summary insight */}
        {forecast?.summary && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground leading-relaxed">{forecast.summary}</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Predicted Cash Flow</h2>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !forecast?.points.length ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">Run a forecast to see the chart.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={forecast.points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="fgBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(190,96%,52%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(190,96%,52%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fgConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(262,83%,64%)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(262,83%,64%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(parseISO(d), "dd MMM")}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false} axisLine={false}
                  interval={13}
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false} axisLine={false} width={52}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                  labelFormatter={(d) => format(parseISO(d), "dd MMM yyyy")}
                />
                <Area type="monotone" dataKey="confidence_upper" stroke="none" fill="url(#fgConfidence)" name="Upper Bound" dot={false} />
                <Area type="monotone" dataKey="predicted_balance" stroke="hsl(190,96%,52%)" strokeWidth={2.5} fill="url(#fgBalance)" name="Balance" dot={false} activeDot={{ r: 4, fill: "hsl(190,96%,52%)", strokeWidth: 0 }} />
                <Area type="monotone" dataKey="confidence_lower" stroke="none" fill="url(#fgConfidence)" name="Lower Bound" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly breakdown table */}
        {forecast?.points && forecast.points.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-[14px] font-semibold">Monthly Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Period", "Expected Inflows", "Expected Outflows", "Net", "Predicted Balance"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Aggregate by month */}
                {Object.entries(
                  forecast.points.reduce((acc: Record<string, ForecastPoint[]>, p) => {
                    const month = format(parseISO(p.date), "MMM yyyy");
                    acc[month] = [...(acc[month] || []), p];
                    return acc;
                  }, {})
                ).map(([month, pts]) => {
                  const totalIn = pts.reduce((s, p) => s + p.predicted_inflow, 0);
                  const totalOut = pts.reduce((s, p) => s + p.predicted_outflow, 0);
                  const net = totalIn - totalOut;
                  const balance = pts[pts.length - 1].predicted_balance;
                  return (
                    <tr key={month} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-foreground">{month}</td>
                      <td className="px-4 py-3.5 currency-font text-primary">{formatCurrency(totalIn)}</td>
                      <td className="px-4 py-3.5 currency-font text-accent">{formatCurrency(totalOut)}</td>
                      <td className={cn("px-4 py-3.5 currency-font font-medium", net >= 0 ? "text-primary" : "text-destructive")}>
                        {net >= 0 ? "+" : ""}{formatCurrency(net)}
                      </td>
                      <td className="px-4 py-3.5 currency-font font-semibold text-foreground">{formatCurrency(balance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

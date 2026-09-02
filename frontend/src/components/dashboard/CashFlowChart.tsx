"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlow } from "@/hooks/useDashboard";
import type { CashFlowPeriod } from "@/types/dashboard";

const PERIODS: { label: string; value: CashFlowPeriod }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs">
      <p className="mb-2 font-medium text-foreground">
        {label ? format(parseISO(label), "dd MMM yyyy") : ""}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="capitalize text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium currency-font text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart() {
  const { data, isLoading, period, setPeriod } = useCashFlow(30);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Cash Flow</h2>
          {data && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Net {data.total_inflows > data.total_outflows ? "inflow" : "outflow"}{" "}
              <span className={cn(
                "font-medium",
                data.total_inflows >= data.total_outflows ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(Math.abs(data.total_inflows - data.total_outflows))}
              </span>{" "}
              this period
            </p>
          )}
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-all",
                period === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <Skeleton className="h-52 w-full" />
        ) : !data?.points.length ? (
          <div className="flex h-52 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No transaction data yet. Upload a bank statement to get started.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={data.points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                {/* Electric Cyan for balance */}
                <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(190,96%,52%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(190,96%,52%)" stopOpacity={0} />
                </linearGradient>
                {/* Deep Violet for inflows */}
                <linearGradient id="gradInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(262,83%,64%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(262,83%,64%)" stopOpacity={0} />
                </linearGradient>
                {/* Muted red for outflows */}
                <linearGradient id="gradOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(0,72%,56%)" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="hsl(0,72%,56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(parseISO(d), period === 7 ? "EEE" : "dd MMM")}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval={period === 90 ? 13 : period === 30 ? 4 : 0}
              />
              <YAxis
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Cyan — running balance (primary KPI) */}
              <Area
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="hsl(190,96%,52%)"
                strokeWidth={2.5}
                fill="url(#gradBalance)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(190,96%,52%)", strokeWidth: 0 }}
              />
              {/* Violet — inflows */}
              <Area
                type="monotone"
                dataKey="inflows"
                name="Inflows"
                stroke="hsl(262,83%,64%)"
                strokeWidth={1.5}
                fill="url(#gradInflow)"
                dot={false}
                activeDot={{ r: 3, fill: "hsl(262,83%,64%)", strokeWidth: 0 }}
              />
              {/* Muted red — outflows */}
              <Area
                type="monotone"
                dataKey="outflows"
                name="Outflows"
                stroke="hsl(0,72%,56%)"
                strokeWidth={1.5}
                fill="url(#gradOutflow)"
                dot={false}
                activeDot={{ r: 3, fill: "hsl(0,72%,56%)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

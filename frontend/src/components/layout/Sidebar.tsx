"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  FileText,
  GitMerge,
  LayoutDashboard,
  LineChart,
  Receipt,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/authStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Invoices", href: ROUTES.INVOICES, icon: Receipt },
  { label: "Transactions", href: ROUTES.TRANSACTIONS, icon: GitMerge },
  { label: "Reconciliation", href: ROUTES.RECONCILIATION, icon: BarChart3 },
  { label: "Forecasts", href: ROUTES.FORECASTS, icon: TrendingUp },
  { label: "Copilot", href: ROUTES.COPILOT, icon: Bot },
  { label: "Reports", href: ROUTES.REPORTS, icon: FileText },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const business = useAuthStore((s) => s.business);

  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
          <span className="text-[11px] font-bold text-primary-foreground">FP</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-sidebar-foreground">FinPilot AI</p>
          {business && (
            <p className="truncate text-[11px] text-muted-foreground">{business.name}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <TooltipProvider delayDuration={0}>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                        active
                          ? "border-l-2 border-primary bg-primary/10 pl-[10px] text-primary"
                          : "text-muted-foreground hover:bg-primary/8 hover:text-primary"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )}
                      />
                      {label}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Settings */}
      <div className="border-t border-sidebar-border px-2 py-3">
        <Link
          href={ROUTES.SETTINGS}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
            pathname.startsWith(ROUTES.SETTINGS)
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

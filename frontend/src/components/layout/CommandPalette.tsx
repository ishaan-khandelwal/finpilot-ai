"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Bot, FileText, LayoutDashboard, Receipt, Search, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const COMMANDS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, group: "Pages" },
  { label: "Invoices", href: ROUTES.INVOICES, icon: Receipt, group: "Pages" },
  { label: "Reconciliation", href: ROUTES.RECONCILIATION, icon: BarChart3, group: "Pages" },
  { label: "Forecasts", href: ROUTES.FORECASTS, icon: TrendingUp, group: "Pages" },
  { label: "Copilot", href: ROUTES.COPILOT, icon: Bot, group: "Pages" },
  { label: "Reports", href: ROUTES.REPORTS, icon: FileText, group: "Pages" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-command-palette", handleOpen);

    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("open-command-palette", handleOpen);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl animate-fade-in rounded-2xl border border-border bg-card shadow-2xl shadow-black/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, invoices, actions…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found</p>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.href}
                onClick={() => navigate(cmd.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground text-foreground text-left"
                )}
              >
                <cmd.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {cmd.label}
                <span className="ml-auto text-xs text-muted-foreground">{cmd.group}</span>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-border px-4 py-2 flex gap-4">
          <span className="text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>{" "}
            navigate
          </span>
          <span className="text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>{" "}
            open
          </span>
          <span className="text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  GitMerge,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? ROUTES.DASHBOARD;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authService.login({ email, password });
      router.push(from as any);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as { message?: string })?.message ??
        "Invalid credentials or connection error. Try the 1-Click Demo Login below!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    setEmail("demo@finpilot.ai");
    setPassword("Demo@12345");

    try {
      await authService.loginWithDemo();
      router.push(from as any);
    } catch {
      setError("Unable to launch demo mode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("demo@finpilot.ai");
    setPassword("Demo@12345");
    setError(null);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
      {/* Left Column: Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_0_30px_hsl(190_96%_52%/0.45)]">
            <span className="text-base font-extrabold text-primary-foreground tracking-wider">FP</span>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              FinPilot <span className="text-primary">AI</span>
            </span>
            <p className="text-xs text-muted-foreground">Autonomous Finance Controller</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Stop drowning in spreadsheets. Let AI pilot your books.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reconcile bank statements, capture invoice OCR, predict cash flow 90 days out, and get instant answers from your private Financial Copilot.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-md transition-all hover:border-primary/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Instant Invoice & Statement OCR</p>
              <p className="text-[11px] text-muted-foreground">Extract line items, GSTIN, and taxes automatically</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-md transition-all hover:border-accent/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <GitMerge className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Smart Auto-Reconciliation</p>
              <p className="text-[11px] text-muted-foreground">Fuzzy match transactions against invoices with discrepancy detection</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-md transition-all hover:border-primary/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">90-Day Cash Flow Predictions</p>
              <p className="text-[11px] text-muted-foreground">Confidence bounds and burn rate alerts before cash runs short</p>
            </div>
          </div>
        </div>

        {/* Mini metric ticker */}
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium text-foreground">Live AI Engine</span>
          </div>
          <span className="font-mono text-primary font-semibold">99.4% Match Accuracy</span>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="w-full lg:col-span-6 max-w-md mx-auto">
        <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_hsl(190_96%_52%/0.4)]">
              <span className="text-xs font-bold text-primary-foreground">FP</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                FinPilot <span className="text-primary">AI</span>
              </h2>
              <p className="text-xs text-muted-foreground">Autonomous Finance Controller</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-xs text-muted-foreground">Sign in to your business dashboard</p>
          </div>

          {/* Quick Demo Access banner */}
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Explore Demo Workspace</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Test the complete dashboard & AI copilot instantly with one click.
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_0_12px_hsl(190_96%_52%/0.3)] transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                <span>1-Click Demo Login</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Fill credentials
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>Email address</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  disabled={loading}
                  className={cn(
                    "w-full rounded-lg border border-input bg-background/80 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                    "transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "disabled:opacity-50"
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={cn(
                    "w-full rounded-lg border border-input bg-background/80 py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60",
                    "transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "disabled:opacity-50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-input bg-background text-primary focus:ring-primary/30 h-3.5 w-3.5"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                <span className="font-semibold shrink-0">Error:</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-lg bg-primary py-2.5 px-4 text-sm font-semibold text-primary-foreground",
                "shadow-[0_0_16px_hsl(190_96%_52%/0.35)] transition-all",
                "hover:bg-primary/90 hover:shadow-[0_0_24px_hsl(190_96%_52%/0.5)] active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social / Workspace Sign-in */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-3 text-[11px] text-muted-foreground uppercase tracking-wider">
                Or sign in with
              </span>
              <div className="border-t border-border w-full" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 hover:border-primary/40 transition-colors"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.8 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.4-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z" />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 hover:border-accent/40 transition-colors"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>Microsoft</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Create business account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => { setForgotOpen(false); setForgotSent(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-semibold text-foreground text-sm">Reset Password</h3>
            </div>

            {forgotSent ? (
              <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-xs text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Password reset instructions sent to <strong>{forgotEmail}</strong>. Check your inbox or use the 1-Click Demo login.</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In self-hosted / development mode, you can log in directly with the 1-Click Demo account, or enter your registered business email below to receive a reset link.
                </p>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setForgotOpen(false); setForgotSent(false); }}
                className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {forgotSent ? "Close" : "Cancel"}
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Send Instructions
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

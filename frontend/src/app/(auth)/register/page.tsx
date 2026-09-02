"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

interface FieldErrors {
  full_name?: string;
  email?: string;
  password?: string;
  business_name?: string;
  gstin?: string;
  terms?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    business_name: "",
    gstin: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  // Password checks
  const pwd = form.password;
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const strengthScore = [hasMinLen, hasUpper, hasNumber].filter(Boolean).length;

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!form.full_name.trim()) errors.full_name = "Full name is required";
    if (!form.email.includes("@") || !form.email.includes(".")) errors.email = "Enter a valid email address";
    if (!hasMinLen) errors.password = "Password must be at least 8 characters";
    else if (!hasUpper) errors.password = "Password must include at least 1 uppercase letter";
    else if (!hasNumber) errors.password = "Password must include at least 1 number";
    if (!form.business_name.trim()) errors.business_name = "Business name is required";
    if (form.gstin.trim() && !GSTIN_REGEX.test(form.gstin.trim().toUpperCase())) {
      errors.gstin = "Invalid GSTIN format (e.g. 29ABCDE1234F1Z5)";
    }
    if (!agreedTerms) errors.terms = "You must agree to the Terms of Service";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError(null);
    setLoading(true);

    try {
      await authService.register({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        business_name: form.business_name.trim(),
        gstin: form.gstin.trim() ? form.gstin.trim().toUpperCase() : undefined,
      });
      router.push(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as { message?: string })?.message ??
        "Registration could not be completed. Please check your connection or try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    setForm({
      full_name: "Riya Sharma",
      email: `riya.${Math.floor(Math.random() * 1000)}@techcorp.in`,
      password: "Password@123",
      business_name: "TechCorp Financial Services Ltd",
      gstin: "27AAACF1234M1Z2",
    });
    setAgreedTerms(true);
    setFieldErrors({});
    setServerError(null);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
      {/* Left Column: Benefits & Value Prop (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
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

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground leading-snug">
            Automate your entire finance back-office in 60 seconds.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Join hundreds of forward-thinking founders and financial controllers who automated bookkeeping, reconciliation, and GST tracking.
          </p>
        </div>

        {/* Benefits list */}
        <div className="space-y-3 pt-2">
          {[
            {
              title: "AI-Powered Invoice Parsing",
              desc: "Drop PDF or image invoices to extract totals, HSN codes, and GST rates instantly.",
            },
            {
              title: "Two-Way Bank Reconciliation",
              desc: "Never miss a missing payment or double charge with automated matching.",
            },
            {
              title: "Cash Flow Runway Intelligence",
              desc: "Forecast 90-day liquidity and detect budget leaks before they happen.",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-md">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Check className="h-3 w-3" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <span>Multi-tenant data isolation with hardware-level encryption at rest.</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:col-span-7 max-w-lg mx-auto">
        <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_hsl(190_96%_52%/0.4)]">
              <span className="text-xs font-bold text-primary-foreground">FP</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                FinPilot <span className="text-primary">AI</span>
              </h2>
              <p className="text-xs text-muted-foreground">Create Business Account</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Set up your workspace</h1>
              <p className="mt-1 text-xs text-muted-foreground">Free 30-day full access • No credit card required</p>
            </div>
            <button
              type="button"
              onClick={fillSampleData}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              <span>Auto-Fill Sample</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label htmlFor="full_name" className="text-xs font-medium text-foreground">
                  Your full name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={form.full_name}
                    onChange={update("full_name")}
                    placeholder="Riya Sharma"
                    disabled={loading}
                    className={cn(
                      "w-full rounded-lg border bg-background/80 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                      "transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                      fieldErrors.full_name ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    )}
                  />
                </div>
                {fieldErrors.full_name && <p className="text-[11px] text-destructive">{fieldErrors.full_name}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-foreground">
                  Work email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    placeholder="riya@company.com"
                    disabled={loading}
                    className={cn(
                      "w-full rounded-lg border bg-background/80 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                      "transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                      fieldErrors.email ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    )}
                  />
                </div>
                {fieldErrors.email && <p className="text-[11px] text-destructive">{fieldErrors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-foreground">
                Create password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Min. 8 chars, 1 uppercase, 1 digit"
                  disabled={loading}
                  className={cn(
                    "w-full rounded-lg border bg-background/80 py-2 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60",
                    "transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                    fieldErrors.password ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Live Password Checklist */}
              {pwd && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-300", strengthScore >= 1 ? "w-1/3 bg-destructive" : "w-0")} />
                    <div className={cn("h-full transition-all duration-300", strengthScore >= 2 ? "w-1/3 bg-warning" : "w-0")} />
                    <div className={cn("h-full transition-all duration-300", strengthScore >= 3 ? "w-1/3 bg-primary" : "w-0")} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className={cn("flex items-center gap-1", hasMinLen ? "text-primary font-medium" : "")}>
                      {hasMinLen ? "✓" : "•"} 8+ chars
                    </span>
                    <span className={cn("flex items-center gap-1", hasUpper ? "text-primary font-medium" : "")}>
                      {hasUpper ? "✓" : "•"} 1 Uppercase
                    </span>
                    <span className={cn("flex items-center gap-1", hasNumber ? "text-primary font-medium" : "")}>
                      {hasNumber ? "✓" : "•"} 1 Number
                    </span>
                  </div>
                </div>
              )}
              {fieldErrors.password && <p className="text-[11px] text-destructive">{fieldErrors.password}</p>}
            </div>

            {/* Business Details Divider */}
            <div className="border-t border-border pt-3 space-y-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                <span>Company Information</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="business_name" className="text-xs font-medium text-foreground">
                    Business name
                  </label>
                  <input
                    id="business_name"
                    type="text"
                    required
                    value={form.business_name}
                    onChange={update("business_name")}
                    placeholder="Acme Financial Services Pvt Ltd"
                    disabled={loading}
                    className={cn(
                      "w-full rounded-lg border bg-background/80 py-2 px-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                      "transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                      fieldErrors.business_name ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    )}
                  />
                  {fieldErrors.business_name && <p className="text-[11px] text-destructive">{fieldErrors.business_name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gstin" className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>GSTIN (optional)</span>
                    <span className="text-[10px] text-muted-foreground">15 chars</span>
                  </label>
                  <input
                    id="gstin"
                    type="text"
                    maxLength={15}
                    value={form.gstin}
                    onChange={update("gstin")}
                    placeholder="27AAACF1234M1Z2"
                    disabled={loading}
                    className={cn(
                      "w-full rounded-lg border bg-background/80 py-2 px-3 text-sm font-mono uppercase text-foreground placeholder:text-muted-foreground/60",
                      "transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                      fieldErrors.gstin ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    )}
                  />
                  {fieldErrors.gstin && <p className="text-[11px] text-destructive">{fieldErrors.gstin}</p>}
                </div>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => {
                    setAgreedTerms(e.target.checked);
                    setFieldErrors((fe) => ({ ...fe, terms: undefined }));
                  }}
                  className="mt-0.5 rounded border-input bg-background text-primary focus:ring-primary/30 h-3.5 w-3.5"
                />
                <span>
                  I agree to the{" "}
                  <span className="text-primary hover:underline">Terms of Service</span> and{" "}
                  <span className="text-primary hover:underline">Privacy Policy</span>.
                </span>
              </label>
              {fieldErrors.terms && <p className="text-[11px] text-destructive mt-1">{fieldErrors.terms}</p>}
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                <span className="font-semibold shrink-0">Registration error:</span>
                <span className="flex-1">{serverError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="register-submit"
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
                  <span>Creating Business Workspace…</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

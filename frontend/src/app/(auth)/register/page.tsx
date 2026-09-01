"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

interface FieldError {
  email?: string;
  password?: string;
  full_name?: string;
  business_name?: string;
  gstin?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    business_name: "",
    gstin: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errors: FieldError = {};
    if (!form.full_name.trim()) errors.full_name = "Full name is required";
    if (!form.email.includes("@")) errors.email = "Enter a valid email";
    if (form.password.length < 8) errors.password = "Minimum 8 characters";
    if (!/[A-Z]/.test(form.password)) errors.password = "Must include an uppercase letter";
    if (!/[0-9]/.test(form.password)) errors.password = "Must include a number";
    if (!form.business_name.trim()) errors.business_name = "Business name is required";
    if (form.gstin && !GSTIN_REGEX.test(form.gstin)) errors.gstin = "Invalid GSTIN format";
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
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        business_name: form.business_name,
        gstin: form.gstin || undefined,
      });
      router.push(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Registration failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up FinPilot for your business in under a minute
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="full_name"
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Riya Sharma"
              value={form.full_name}
              onChange={update("full_name")}
              error={fieldErrors.full_name}
              disabled={loading}
            />
            <Field
              id="email"
              label="Work email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={update("email")}
              error={fieldErrors.email}
              disabled={loading}
            />
          </div>

          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={form.password}
            onChange={update("password")}
            error={fieldErrors.password}
            disabled={loading}
          />

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Business details
            </p>
            <div className="space-y-4">
              <Field
                id="business_name"
                label="Business name"
                type="text"
                placeholder="Acme Private Limited"
                value={form.business_name}
                onChange={update("business_name")}
                error={fieldErrors.business_name}
                disabled={loading}
              />
              <Field
                id="gstin"
                label="GSTIN (optional)"
                type="text"
                placeholder="29AABCA1234A1Z5"
                value={form.gstin}
                onChange={update("gstin")}
                error={fieldErrors.gstin}
                disabled={loading}
                hint="15-character GST Identification Number"
              />
            </div>
          </div>

          {serverError && (
            <div className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className={cn(
              "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "transition-all hover:bg-primary/90 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "shadow-sm shadow-primary/20"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
            <span className="text-foreground">Terms of Service</span> and{" "}
            <span className="text-foreground">Privacy Policy</span>.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

function Field({ id, label, type, placeholder, autoComplete, value, onChange, error, hint, disabled }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border bg-background px-3 py-2.5 text-sm",
          "placeholder:text-muted-foreground/60 text-foreground",
          "transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/20",
          "disabled:opacity-50",
          error ? "border-destructive focus:border-destructive" : "border-input focus:border-ring"
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

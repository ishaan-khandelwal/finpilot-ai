import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign In",
    template: "%s | FinPilot AI",
  },
  description: "Autonomous Finance Controller for Modern Small Businesses & CFOs",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[15%] -top-[20%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute -bottom-[15%] -right-[15%] h-[550px] w-[550px] rounded-full bg-accent/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {children}
      </div>

      {/* Footer footer links */}
      <div className="relative z-10 mt-8 text-center text-xs text-muted-foreground flex items-center gap-4">
        <span>© 2026 FinPilot AI</span>
        <span>•</span>
        <span>Enterprise 256-bit AES</span>
        <span>•</span>
        <span>GST & Bank Reconciled</span>
      </div>
    </div>
  );
}

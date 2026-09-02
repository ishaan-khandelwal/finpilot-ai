import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign In",
    template: "%s | FinPilot AI",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Cyan glow top-left */}
        <div className="absolute -left-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        {/* Violet glow bottom-right */}
        <div className="absolute -bottom-[10%] -right-[10%] h-[450px] w-[450px] rounded-full bg-accent/10 blur-[100px]" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-[0_0_24px_hsl(190_96%_52%/0.5)]">
            <span className="text-sm font-bold tracking-tight text-primary-foreground">FP</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">FinPilot <span className="text-primary">AI</span></span>
        </div>
        {children}
      </div>
    </div>
  );
}

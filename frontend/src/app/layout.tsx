import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "FinPilot AI",
    template: "%s | FinPilot AI",
  },
  description:
    "Autonomous finance controller for small businesses. AI-powered invoice reconciliation, cash flow forecasting, and financial insights.",
  keywords: ["finance", "accounting", "AI", "invoices", "reconciliation", "GST"],
  openGraph: {
    type: "website",
    title: "FinPilot AI",
    description: "Autonomous finance controller for small businesses",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

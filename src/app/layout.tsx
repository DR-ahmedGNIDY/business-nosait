import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Nosait Business — Manage Clients • Projects • Contracts",
    template: "%s | Nosait Business",
  },
  description:
    "Business management platform for web agencies, software companies and freelancers. Clients, projects, subscriptions, contracts, expenses and reports.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://business.nosait.com"),
  openGraph: { title: "Nosait Business", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

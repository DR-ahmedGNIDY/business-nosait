import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getLocale } from "@/lib/i18n-server";
import { isRTL } from "@/lib/i18n";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={isRTL(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}

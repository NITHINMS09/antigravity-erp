// @ts-nocheck
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SK GROUPS - Multi-Business Management",
  description: "ERP system for POWER BRICK and BAKE LAND businesses managed by SK GROUPS. Manage billing, stock, workers, transport, and analytics.",
  manifest: "/manifest.json",
  icons: { apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseMind AI | Employee Feedback & Organizational Intelligence",
  description: "AI-powered enterprise platform for employee feedback management, wellness tracking, burnout prediction, and organizational intelligence.",
  keywords: "employee feedback, AI analytics, organizational intelligence, burnout prediction, wellness tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a1a] min-h-screen antialiased">
        <div className="bg-mesh min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

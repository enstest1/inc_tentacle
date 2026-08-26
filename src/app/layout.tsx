import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { commitMono } from "./fonts";

export const metadata: Metadata = {
  title: "Tentacle — One send. Every wallet.",
  description: "Non-custodial batch payments on Ink.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={commitMono.variable}>
      <body className="min-h-screen bg-ink-bg font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

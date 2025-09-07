import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accounting UI - QuickBooks-class ERP",
  description: "Complete accounting and business management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

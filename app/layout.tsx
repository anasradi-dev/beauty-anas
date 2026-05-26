import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth";
import { AdminAccessGate } from "@/components/admin-access-gate";

export const metadata: Metadata = {
  title: "BEAUTY Commission Sales",
  description: "Cosmetic product commission sales management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AdminAccessGate>{children}</AdminAccessGate>
        </AuthProvider>
      </body>
    </html>
  );
}

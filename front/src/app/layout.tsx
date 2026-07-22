import type { Metadata } from "next";
import "./globals.css";
import MainNav from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Campus Marketplace",
  description: "Achetez et vendez entre étudiants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background">
        <MainNav />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import MainNav from "@/components/main-nav";
import { AuthProvider } from "@/contexts/auth-context";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["200"],
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = {
  title: "Campus Marketplace",
  description: "Achetez et vendez entre étudiants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={nunitoSans.variable}>
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <MainNav />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

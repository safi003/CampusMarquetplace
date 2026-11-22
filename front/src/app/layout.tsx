import type { Metadata } from "next";
import "./globals.css";
import MainNav from "@/components/main-nav";
import { AuthProvider } from "@/contexts/auth-context";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Campus Marketplace",
  description: "Achetez et vendez entre étudiants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;0,6..12,800;1,6..12,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <MainNav />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

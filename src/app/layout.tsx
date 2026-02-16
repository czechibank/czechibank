import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_AUTH_URL || "http://localhost:3000"),
  title: {
    default: "CzechiBank",
    template: "%s | CzechiBank",
  },
  description:
    "A sandbox banking app for developers and students. Learn how APIs work — create accounts, make transfers, and explore REST endpoints. Built by the Czechitas community.",
  keywords: ["banking API", "sandbox", "Czechitas", "REST API", "learning", "fintech"],
  openGraph: {
    title: "CzechiBank — Learn Banking APIs the Fun Way",
    description:
      "A sandbox banking app for developers and students. Create accounts, make transfers, explore REST endpoints — break things, learn, and have fun!",
    siteName: "CzechiBank",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CzechiBank — Learn Banking APIs the Fun Way",
    description:
      "A sandbox banking app for developers and students. Create accounts, make transfers, and explore REST endpoints.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script defer data-domain="czechibank.ostrava.digital" src="https://plausible.ff0000.cz/js/script.js" />
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

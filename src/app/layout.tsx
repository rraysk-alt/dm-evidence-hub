import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import Image from "next/image";
import { NavLinks } from "@/components/NavLinks";
import { UserMenu } from "@/components/UserMenu";
import { LanguageProvider } from "@/context/LanguageContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { EvidenceChat } from "@/components/EvidenceChat";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sales Objections – Evidence Hub",
  description: "Evidence-backed responses to the most common DentalMonitoring sales objections — clinical data, peer-reviewed studies, and real-world ROI in one place.",
  openGraph: {
    title: "Sales Objections – Evidence Hub",
    description: "Evidence-backed responses to the most common DentalMonitoring sales objections — clinical data, peer-reviewed studies, and real-world ROI in one place.",
    siteName: "DentalMonitoring Evidence Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sales Objections – Evidence Hub",
    description: "Evidence-backed responses to the most common DentalMonitoring sales objections.",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
      </head>
      <body className={`${geist.className} bg-[#f6f6f6] min-h-screen`}>
        <SessionProvider>
        <LanguageProvider>
        <nav className="bg-[#f6f6f6] border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="shrink-0">
              <Image src="/logo.png" alt="DentalMonitoring – Smarter Orthodontics" width={180} height={33} className="h-8 w-auto" priority />
            </a>
            <div className="flex items-center gap-1">
              <NavLinks />
              <UserMenu />
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <ScrollToTop />
        <EvidenceChat />
        <footer className="bg-[#f6f6f6] border-t border-gray-200 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2">
            <Image src="/logo.png" alt="DentalMonitoring – Smarter Orthodontics" width={140} height={26} className="h-7 w-auto opacity-70" />
          </div>
        </footer>
        </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

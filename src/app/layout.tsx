import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { NavLinks } from "@/components/NavLinks";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sales Objections – Evidence Hub",
  description: "Evidence-based responses to common DentalMonitoring sales objections.",
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
        <LanguageProvider>
        <nav className="bg-[#f6f6f6] border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <polygon points="8,6 36,20 8,34" fill="#009AAB" />
              </svg>
              <div>
                <div className="font-bold text-gray-900 text-sm leading-tight">DentalMonitoring</div>
                <div className="text-xs text-gray-500 leading-tight">Smarter Orthodontics</div>
              </div>
            </a>
            <NavLinks />
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-[#f6f6f6] border-t border-gray-200 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <polygon points="8,6 36,20 8,34" fill="#009AAB" />
              </svg>
              <span className="font-semibold text-gray-800 text-sm">DentalMonitoring</span>
            </div>
            <p className="text-xs text-gray-500">Smarter Orthodontics</p>
          </div>
        </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
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
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-700">
              <a href="https://docs.google.com/presentation/d/174AIXWPeWtSaF4cDMsnNmzGXUt2Hw3nM1gB3-nej-FI/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-[#009AAB] transition-colors whitespace-nowrap">Marketing Materials</a>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSduFQlv2xWo0PIi_MqJ1bBXjybpZds4phT8tmjoqtg0TDiVUA/viewform" target="_blank" rel="noopener noreferrer" className="hover:text-[#009AAB] transition-colors whitespace-nowrap">Evidence Search Tool</a>
              <a href="https://drive.google.com/file/d/1wDLcYpvDJEVuz4QOQTI43ORjtOkzhCyg/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-[#009AAB] transition-colors whitespace-nowrap">DM Ortho. Report</a>
              <a href="https://rraysk-alt.github.io/dm-evidence-hub/" target="_blank" rel="noopener noreferrer" className="hover:text-[#009AAB] transition-colors whitespace-nowrap">Comprehensive DM Evidence Overview</a>
              <a href="https://www.youtube.com/watch?v=qC8KvkrebPg&list=PLp10aZZZC0JkHpUoI83aqCW1z2JW3E8Jn" target="_blank" rel="noopener noreferrer" className="hover:text-[#009AAB] transition-colors whitespace-nowrap">DM Myths Playlist</a>
            </div>
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
      </body>
    </html>
  );
}

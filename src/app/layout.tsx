import type { Metadata, Viewport } from "next";
import { Archivo, Archivo_Narrow, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const cond = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-cond",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://boiler.market"),
  title: {
    default: "BOILER — the speculative market floor of Robinhood Chain",
    template: "%s · BOILER",
  },
  description:
    "Wall Street attitude. Onchain accountability. Live Robinhood Chain markets, timestamped calls, and a fee model printed on the page.",
  openGraph: {
    title: "BOILER",
    description: "The speculative market floor of Robinhood Chain.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060605",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${cond.variable} ${mono.variable}`}>
      <body className="bg-pitch text-cream antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-term focus:px-3 focus:py-2 focus:text-pitch focus:mono-tight"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

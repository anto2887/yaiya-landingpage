import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Instrument_Sans } from "next/font/google";
import { RevealObserver } from "@/components/RevealObserver";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";
import { site } from "@/content/site";
import "./globals.css";

// Fraunces (soft, slightly wonky serif) for headings; Instrument Sans for body.
// Founder and cofounder, 11 Oct: Fredoka + Inter + Caveat read as AI-generated.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
// Caveat for the handwritten notes (founder kept these, 11 Oct).
const caveat = Caveat({ subsets: ["latin"], weight: ["600"], variable: "--font-caveat", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.meta.title,
  description: site.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: site.meta.title,
    description: site.meta.description,
    images: [{ url: site.meta.ogImage, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FFF3EE", // cream
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${instrument.variable} ${caveat.variable}`}>
      <head>
        {/* Lets CSS hide scroll-reveal content only when JS will reveal it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="relative bg-cream text-ink antialiased">
        {/* Watched by NavScrollState: while it is on screen, the page is at the top. */}
        <div id="top-sentinel" aria-hidden className="pointer-events-none absolute top-0 h-2 w-px" />
        <a
          href="#main"
          className="sr-only z-50 rounded-pill bg-berry px-4 py-3 type-button text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {site.a11y.skipLink}
        </a>
        <Nav />
        {children}
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}

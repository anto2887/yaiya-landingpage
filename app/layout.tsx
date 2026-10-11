import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, Inter } from "next/font/google";
import { RevealObserver } from "@/components/RevealObserver";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";
import { site } from "@/content/site";
import "./globals.css";

// Fredoka: rounded, jelly-soft headings (founder asked for a more playful feel, 11 Oct).
const fredoka = Fredoka({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-fredoka", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-inter", display: "swap" });
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
    <html lang="en" suppressHydrationWarning className={`${fredoka.variable} ${inter.variable} ${caveat.variable}`}>
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

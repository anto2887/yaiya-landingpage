import type { Metadata, Viewport } from "next";
import { Caveat, Inter, Outfit } from "next/font/google";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";
import { site } from "@/content/site";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-outfit", display: "swap" });
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
  themeColor: "#FCF6EE", // cream
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="bg-cream text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-pill bg-ink-deep px-4 py-3 type-button text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {site.a11y.skipLink}
        </a>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}

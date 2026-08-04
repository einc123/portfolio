import type { Metadata } from "next";
import { Instrument_Serif, Outfit, Syne } from "next/font/google";
import { AccountAppearanceSync } from "@/components/AccountAppearanceSync";
import { CodeIntro, introInitScript } from "@/components/CodeIntro";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { CookieConsentBanner } from "@/components/CookieConsent";
import { CustomCursor } from "@/components/CustomCursor";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { InlineScript } from "@/components/InlineScript";
import { JsonLd } from "@/components/JsonLd";
import { PageTransition } from "@/components/PageTransition";
import { ThemeWelcome } from "@/components/ThemeWelcome";
import { accentInitScript } from "@/lib/accent";
import { site } from "@/lib/data";
import { personJsonLd, professionalServiceJsonLd, seo, websiteJsonLd } from "@/lib/seo";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seo.titleDefault,
    template: seo.titleTemplate,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "portfolio",
  applicationName: "Euan MBCS",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    siteName: `${site.name} — Portfolio`,
    title: seo.titleDefault,
    description: seo.ogDescription,
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: `${site.name} — ${site.title}`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: seo.titleDefault,
    description: seo.ogDescription,
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      data-theme="light"
      data-accent="cyan"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${outfit.variable} ${instrument.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-foreground">
        <JsonLd data={personJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={professionalServiceJsonLd()} />
        <InlineScript html={themeInitScript} />
        <InlineScript html={accentInitScript} />
        <InlineScript html={introInitScript} />
        <CodeIntro />
        <PageTransition />
        <ThemeWelcome />
        <AccountAppearanceSync />
        <CustomCursor />
        <CookieConsentBanner />
        <AnalyticsBeacon />
        <div className="site-shell flex min-h-full flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

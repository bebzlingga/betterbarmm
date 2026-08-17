import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "./_components/site-footer";
import { themeInitScript } from "./_components/theme-toggle";
import "./globals.css";

// DM Sans reads the body copy, Outfit sets headings, buttons and labels.
// Both are variable, so every weight the design uses comes from one file each.
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BetterBARMM | Better Transparency. Better Governance.",
  description:
    "Official BetterBARMM landing site for government transparency and citizen services.",
  icons: {
    icon: [{ url: "/images/logo-ico.png", type: "image/png" }],
    shortcut: [{ url: "/images/logo-ico.png", type: "image/png" }],
    apple: [{ url: "/images/logo-ico.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // The theme script below writes `data-theme` to <html> ahead of React,
      // so the server's markup and the client's differ by that one attribute.
      suppressHydrationWarning
      className={`${dmSans.variable} ${outfit.variable} h-full bg-[var(--paper)] text-[var(--ink)]`}
    >
      <head>
        {/* Resolves the theme before first paint, so a dark-mode reader never
            gets a white flash on load or navigation. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Without JS the reveal animation never runs, so force content visible. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      <body className="min-h-full bg-[var(--paper)] antialiased">
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}

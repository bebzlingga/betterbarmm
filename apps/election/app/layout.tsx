import type { Metadata } from "next";
import { MotionProvider } from '@betterbarmm/editorial'
import { DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "BetterBARMM Election",
  description:
    "A public workspace for the 2026 BARMM Parliamentary Elections, including regional party entries, sectoral candidates, district COC filers, sources, and election timeline.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${outfit.variable} h-full bg-[var(--paper)] text-[var(--ink)]`}
    >
      <head>
        {/* Without JS the reveal animation never runs, so force content visible. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        <noscript>
          <style>{`[data-anim]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      <body className="min-h-full bg-[var(--paper)] antialiased">
        <MotionProvider>
        {children}
        <Analytics />
        </MotionProvider>
      </body>
    </html>
  );
}

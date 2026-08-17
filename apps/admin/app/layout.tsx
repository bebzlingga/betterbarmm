import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
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
  title: "BetterBARMM Admin",
  description:
    "Administration dashboard for managing bills, budgets, and public content.",
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
      <body className="min-h-full bg-[var(--paper)] antialiased">
        {children}
      </body>
    </html>
  );
}

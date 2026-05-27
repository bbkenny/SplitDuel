import { Metadata, Viewport } from "next";
import { Web3Providers } from "./providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | AutoSplit",
    default: "AutoSplit — Multi-Transaction Financial Outcomes",
  },
  description:
    "AutoSplit is a miniapp that allows one transaction to result in multiple financial outcomes, automatically splitting, saving, and investing in real time.",
  keywords: [
    "AutoSplit",
    "automation",
    "Celo",
    "DeFi",
    "smart contracts",
    "payments",
    "financial outcomes",
  ],
  authors: [{ name: "AutoSplit Team" }],
  creator: "AutoSplit Team",
  openGraph: {
    type: "website",
    title: "AutoSplit — Multi-Transaction Financial Outcomes",
    description:
      "Send once, split automatically. One transaction, multiple outcomes on Celo.",
    siteName: "AutoSplit",
    images: [
      {
        url: "/autosplit-logo.png",
        width: 1200,
        height: 630,
        alt: "AutoSplit Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoSplit — Multi-Transaction Financial Outcomes",
    description:
      "Send once, split automatically. One transaction, multiple outcomes on Celo.",
    images: ["/autosplit-logo.png"],
  },
  icons: {
    icon: "/autosplit.svg",
    shortcut: "/autosplit.svg",
    apple: "/autosplit-logo.png",
  },
  robots: { index: true, follow: true },
  other: {
    "talentapp:project_verification":
      "6aa1bfe48f7a9e3ff5e6bec896de3882caf5b295ce9f859bda473e9ab41f2678d05b2f8fcd4c48e37d8b31c2b63e04bcc0698ff6c983ef92299830d4907ec91e",
  },
  metadataBase: new URL("https://auto-splits.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#022D2B" }],
  width: "device-width",
  initialScale: 1,
};

import { AutoSplitProvider } from "@/components/AutoSplitProvider";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { SplitToaster } from "@/components/ui/Toast";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white antialiased">
        <Web3Providers>
          <AutoSplitProvider>
            <Navbar />
            <main>{children}</main>
            <OnboardingTour />
            <SplitToaster />
          </AutoSplitProvider>
        </Web3Providers>
      </body>
    </html>
  );
}

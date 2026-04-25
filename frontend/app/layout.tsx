import { Metadata, Viewport } from "next";
import { Web3Providers } from "./providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoSplit",
  description:
    "Send once, and your money automatically splits, saves, and invests in real time.",
  other: {
    "talentapp:project_verification":
      "6aa1bfe48f7a9e3ff5e6bec896de3882caf5b295ce9f859bda473e9ab41f2678d05b2f8fcd4c48e37d8b31c2b63e04bcc0698ff6c983ef92299830d4907ec91e",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0a0a1a" }],
  width: "device-width",
  initialScale: 1,
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Web3Providers>
          <Navbar />
          <main>{children}</main>
        </Web3Providers>
      </body>
    </html>
  );
}

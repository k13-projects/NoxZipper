import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOXZIPPER - Kitchen Exhaust Hood Cleaning",
  description: "Internal dashboard for NOXZIPPER kitchen exhaust hood cleaning business - Fire Safety Compliance System",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[var(--nox-bg-base)] text-[var(--nox-text-primary)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

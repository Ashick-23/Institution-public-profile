import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Research Intelligence | Institution Profile",
  description: "Academic Research Intelligence Platform — explore institutional research output, impact metrics, and scholarly collaboration networks.",
  keywords: "academic research, institution profile, bibliometrics, research output, OpenAlex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Georgia is a system font — no import needed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Open Sans: brand body font per Ashoka Branding Toolkit */}
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${openSans.variable} bg-background text-foreground antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

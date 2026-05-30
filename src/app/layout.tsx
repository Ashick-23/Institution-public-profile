import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..900;1,8..60,300..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} bg-background text-foreground antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

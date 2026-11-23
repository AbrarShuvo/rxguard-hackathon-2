import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RxGuard — Prescription & Lab Safety Decoder",
  description:
    "Upload your prescription and lab report to catch medication conflicts and get a plain-language daily pill schedule. Zero login. Zero data storage.",
  openGraph: {
    title: "RxGuard — Prescription & Lab Safety Decoder",
    description:
      "AI-powered medication safety analysis. Catch drug-lab conflicts instantly. 100% stateless and private.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

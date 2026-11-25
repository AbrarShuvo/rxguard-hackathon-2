import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Velaris from "@/components/ui/velaris";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

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
      <body className={`${inter.variable} ${jakarta.variable} ${inter.className} antialiased`}>
        {/* Living gradient background for the whole page (fixed, borderless) */}
        <Velaris fixed speed={1.2} grain={0.3} />
        {children}
      </body>
    </html>
  );
}

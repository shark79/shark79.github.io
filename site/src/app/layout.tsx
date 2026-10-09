import type { Metadata, Viewport } from "next";
import { Geist_Mono, Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "AI Engineer building agentic systems and clinical AI that knows when to stop and ask a human.";

export const metadata: Metadata = {
  title: "Shashank Jamkhandi · AI Engineer",
  description,
  openGraph: { title: "Shashank Jamkhandi · AI Engineer", description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${onest.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

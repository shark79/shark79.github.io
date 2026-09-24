import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Shashank Jamkhandi · AI Engineer",
  description:
    "AI Engineer building agentic systems and clinical AI that knows when to stop and ask a human. A claymorphic castle you can explore, room by room.",
  openGraph: {
    title: "Shashank Jamkhandi · AI Engineer",
    description:
      "AI Engineer building agentic systems and clinical AI that knows when to stop and ask a human.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF7F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="paper-grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

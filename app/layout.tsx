import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://docu-chat-ai-ochre.vercel.app"),
  title: "DocuChat AI",
  description: "AI-powered document Q&A application built with Next.js, LangChain, and Google Gemini.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "DocuChat AI",
    description: "AI-powered document Q&A application built with Next.js, LangChain, and Google Gemini.",
    url: "https://docu-chat-ai-ochre.vercel.app",
    siteName: "DocuChat AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocuChat AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuChat AI",
    description: "AI-powered document Q&A application built with Next.js, LangChain, and Google Gemini.",
    images: ["/og-image.png"],
  },
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

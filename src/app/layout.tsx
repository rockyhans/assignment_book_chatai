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

const siteUrl = "https://assignment-book-chatai.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dumroo.ai | Book Q&A Chatbot (Online & Offline RAG)",
    template: "%s | Dumroo.ai Book Q&A",
  },
  description:
    "AI-powered K-12 textbook Q&A chatbot with verified source citations, featuring dual Online Generative RAG and Offline Extractive RAG.",
  keywords: [
    "RAG chatbot",
    "book Q&A",
    "K-12 education AI",
    "Dumroo.ai",
    "textbook assistant",
    "offline AI chatbot",
    "retrieval augmented generation",
  ],
  authors: [{ name: "Danish Rizwan" }],
  creator: "Danish Rizwan",

  openGraph: {
    title: "Dumroo.ai | Book Q&A Chatbot (Online & Offline RAG)",
    description:
      "Ask anything about your textbook. Dual-mode RAG chatbot with verifiable page citations — works online (cloud LLM) or fully offline (local extractive AI).",
    url: siteUrl,
    siteName: "Dumroo.ai Book Q&A",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dumroo.ai Book Q&A Chatbot preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Dumroo.ai | Book Q&A Chatbot",
    description:
      "Dual-mode RAG chatbot for textbooks — Online Generative RAG and Offline Extractive RAG, with verifiable page citations.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
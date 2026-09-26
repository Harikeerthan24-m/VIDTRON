/**
 * Root layout — applies Inter font from Google Fonts, meta tags, and SEO.
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIDTRON — Real-Time AI Virtual Try-On",
  description:
    "Try on clothes virtually in real-time using your webcam and AI. Upload any garment image and see yourself wearing it instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

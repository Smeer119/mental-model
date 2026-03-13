import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mental Therapy App",
  description: "AI-Powered Mental Therapy App UI",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outfit.variable} font-sans antialiased text-[#1c1c1e]`}>
        <div className="mx-auto max-w-md min-h-screen bg-[#efebf0] relative shadow-2xl overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

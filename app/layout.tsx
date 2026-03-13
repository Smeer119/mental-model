import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NotificationManager from "@/components/NotificationManager";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning className={`${outfit.variable} font-sans antialiased text-[#1c1c1e]`}>
        <div className="mx-auto max-w-md min-h-screen bg-[#efebf0] relative shadow-2xl overflow-hidden">
          <NotificationManager />
          {children}
        </div>
      </body>
    </html>
  );
}

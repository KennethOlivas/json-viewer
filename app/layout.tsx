import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { JsonProvider } from "@/providers/JsonProvider";
import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JSON Viewer & Editor",
  description: "Modern JSON viewer/editor with animations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <JsonProvider>
            <ToastProvider />
            <div id="app-root" className="min-h-dvh pb-16">
              {children}
            </div>
            <BottomNav />
          </JsonProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

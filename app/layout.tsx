import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { JsonProvider } from "@/providers/JsonProvider";
import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/ToastProvider";
import { SiteHeader } from "@/components/SiteHeader";

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
            <div id="app-root" className="min-h-dvh">
              {/* Dynamic glass background */}
              <div aria-hidden className="dynamic-bg">
                <div className="bg-glow a" />
                <div className="bg-glow b" />
                <div className="bg-glow c" />
                <div className="bg-vignette" />
              </div>
              <div className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
                <SiteHeader />
              </div>
              {children}
            </div>
            {/* Footer */}
            <footer className="-mt-6">
              <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-sm md:flex-row md:text-left">
                <div className="text-muted-foreground">
                  © {new Date().getFullYear()} JSON Studio, Crafted by Kenneth
                  Olivas
                </div>
                <div className="flex items-center gap-4">
                  <a
                    className="text-muted-foreground hover:text-foreground"
                    href="https://github.com/KennethOlivas/json-viewer"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </div>
                <div className="text-muted-foreground">
                  Made with ♥ using ShadCN + Framer Motion
                </div>
              </div>
            </footer>
            <BottomNav />
          </JsonProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

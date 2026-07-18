import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/nav/bottom-nav";
import { QuickCaptureFab } from "@/components/capture/quick-capture-fab";
import { DemoSeed } from "@/components/demo-seed";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Andrea — Agenda de contenido",
  description: "Calendario, ideas e inspiracion para el contenido de Andrea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Andrea",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-muted/30">
        <DemoSeed />
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-24">
          {children}
        </div>
        <QuickCaptureFab />
        <BottomNav />
      </body>
    </html>
  );
}

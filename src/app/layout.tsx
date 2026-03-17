import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Support Team Manager",
  description: "Manage daily support team availability",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-circle.png",
    apple: "/logo-circle.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Support App",
  },
};

export const viewport: Viewport = {
  themeColor: "#00a0e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}

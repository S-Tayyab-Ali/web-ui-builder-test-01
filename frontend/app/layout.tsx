import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { LocationProvider } from "@/lib/location-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Finder - Discover Restaurants Near You",
  description: "Find and save your favorite restaurants with Food Finder",
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
        <NextTopLoader color="#f97316" showSpinner={false} />
        <AuthProvider>
          <LocationProvider>
            {children}
            <Toaster position="top-center" richColors />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}



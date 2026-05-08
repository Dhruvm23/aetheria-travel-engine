import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { DashboardHeader } from "@/components/auth/DashboardHeader";
import { SignInModal } from "@/components/auth/SignInModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aetheria — AI Travel Planning Engine",
  description:
    "A premium AI-powered travel planning and experience engine. Generate time-blocked itineraries, simulate real-time disruptions, assess terrain accessibility, and explore cultural pocket guides.",
  keywords: [
    "travel planner",
    "AI itinerary",
    "trip planning",
    "accessibility travel",
    "cultural guide",
  ],
  authors: [{ name: "Aetheria" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d0f12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <DashboardHeader />
          <div className="pt-14 flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
            {children}
          </div>
          <SignInModal />
        </AuthProvider>
      </body>
    </html>
  );
}

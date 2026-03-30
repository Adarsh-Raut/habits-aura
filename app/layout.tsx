import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Providers from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Habits Aura - Build Habits, Track Consistency",
    template: "%s | Habits Aura",
  },
  description:
    "Track daily habits, build streaks, earn aura points, and compete on the leaderboard. Your gamified habit tracker for lasting consistency.",
  keywords: [
    "habit tracker",
    "habit tracking",
    "streak",
    "productivity",
    "gamification",
    "aura points",
  ],
  authors: [{ name: "Adarsh Raut" }],
  creator: "Adarsh Raut",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Habits Aura",
    title: "Habits Aura - Build Habits, Track Consistency",
    description:
      "Track daily habits, build streaks, earn aura points, and compete on the leaderboard.",
  },
  twitter: {
    card: "summary",
    title: "Habits Aura - Build Habits, Track Consistency",
    description:
      "Track daily habits, build streaks, earn aura points, and compete on the leaderboard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Toaster
            position="bottom-center"
            richColors
            closeButton
            theme="dark"
            toastOptions={{
              style: {
                background: "#262626",
                border: "1px solid #404040",
                color: "#e5e5e5",
              },
            }}
          />
          <div className="drawer lg:drawer-open min-h-screen bg-[#1E2330]">
            <input
              id="sidebar-drawer"
              type="checkbox"
              className="drawer-toggle"
            />

            <div className="drawer-content flex flex-col relative z-0">
              <Navbar />
              <main className="flex-1 overflow-y-auto p-4">{children}</main>
            </div>

            <div className="drawer-side">
              <label
                htmlFor="sidebar-drawer"
                className="drawer-overlay lg:hidden"
              />
              <Sidebar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

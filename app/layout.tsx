import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

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
    <html lang="en" data-theme="habits">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
        {children}
      </body>
    </html>
  );
}

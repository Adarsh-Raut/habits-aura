import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Figtree } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#f5f5f2",
};

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
    <html
      lang="en"
      data-theme="habits"
      className={`${figtree.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          theme="light"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #d9d9d4",
              color: "#0b0b0c",
              fontWeight: 600,
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
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
  title: "Habits Aura",
  description: "Habits dictate your aura",
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

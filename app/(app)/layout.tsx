import GuestBanner from "@/app/components/GuestBanner";
import QueryProvider from "@/app/components/QueryProvider";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import TimezoneSync from "@/app/components/TimezoneSync";
import { getAppSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <QueryProvider>
      <TimezoneSync />
      <div className="drawer min-h-screen bg-base-100 lg:drawer-open">
        <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content relative z-0 flex flex-col">
          <Navbar user={session.user} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {session.user.guestExpiresAt !== undefined && (
              <GuestBanner expiresAt={session.user.guestExpiresAt} />
            )}
            {children}
          </main>
        </div>

        <div className="drawer-side">
          <label
            htmlFor="sidebar-drawer"
            className="drawer-overlay lg:hidden"
          />
          <Sidebar />
        </div>
      </div>
    </QueryProvider>
  );
}

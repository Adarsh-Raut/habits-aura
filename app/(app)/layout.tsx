import { HabitsStoreProvider } from "@/app/components/HabitsStoreProvider";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <HabitsStoreProvider>
      <div className="drawer min-h-screen bg-[#1E2330] lg:drawer-open">
        <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content relative z-0 flex flex-col">
          <Navbar user={session.user} />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>

        <div className="drawer-side">
          <label htmlFor="sidebar-drawer" className="drawer-overlay lg:hidden" />
          <Sidebar />
        </div>
      </div>
    </HabitsStoreProvider>
  );
}

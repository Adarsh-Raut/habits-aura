import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open min-h-screen bg-[#1E2330]">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col relative z-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>

      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay lg:hidden" />
        <Sidebar />
      </div>
    </div>
  );
}

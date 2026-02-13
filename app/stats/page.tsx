import Sidebar from "@/app/components/Sidebar";
import StatsView from "@/app/components/StatsView";

export default function StatsPage() {
  return (
    <main className="flex h-screen bg-[#1E2330]">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <StatsView />
      </div>
    </main>
  );
}

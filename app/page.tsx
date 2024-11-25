import React from "react";
import PlusIconInput from "./components/PlusIconInput";
import CreateHabitForm from "./components/CreateHabitForm";
import Habit from "./components/Habit";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

type Props = {};

function Home({}: Props) {
  return (
    <main className="flex h-screen bg-[#1E2330]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <Habit />
        </div>
      </div>
    </main>
  );
}

export default Home;

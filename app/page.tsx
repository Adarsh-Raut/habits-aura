import React from "react";
import PlusIconInput from "./components/PlusIconInput";
import CreateHabitForm from "./components/CreateHabitForm";
import Habit from "./components/Habit";

type Props = {};

function Home({}: Props) {
  return (
    <main>
      <PlusIconInput />
      <Habit />
    </main>
  );
}

export default Home;

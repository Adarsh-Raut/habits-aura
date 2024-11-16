import React from "react";
import PlusIconInput from "./components/PlusIconInput";
import CreateHabitForm from "./components/CreateHabitForm";
import Todos from "./components/Habit";

type Props = {};

function Home({}: Props) {
  return (
    <main>
      <PlusIconInput />
      <Todos />
      <CreateHabitForm />
    </main>
  );
}

export default Home;

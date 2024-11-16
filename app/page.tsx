import React from "react";
import PlusIconInput from "./components/PlusIconInput";
import CreateHabitForm from "./components/CreateHabitForm";

type Props = {};

function Home({}: Props) {
  return (
    <main>
      <h1>Home</h1>
      <PlusIconInput />
      <CreateHabitForm />
    </main>
  );
}

export default Home;

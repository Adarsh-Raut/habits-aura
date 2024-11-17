"use client";

import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

export default function CreateHabitForm() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [selectedHabit, setSelectedHabit] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
  ]);

  const dayDisplayMap = {
    MON: "M",
    TUE: "T",
    WED: "W",
    THU: "T",
    FRI: "F",
    SAT: "S",
    SUN: "S",
  };

  const habitOptions: string[] = [
    "💪 Workout",
    "🇪🇸 Learn Spanish",
    "🇺🇸 Learn English",
    "🚭 Stop smoking",
    "📚 Read",
    "🇨🇳 Learn Chinese",
    "🚫 No alcohol",
    "🧘 Meditate",
    "💧 Drink",
    "🚶 Walk",
  ];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleHabitSelect = (option: string) => {
    setSelectedHabit(option);
    setInputValue(option);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setInputValue(e.target.value);
    setSelectedHabit("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const habitTitle = inputValue || selectedHabit;

    if (!habitTitle) {
      console.error("Please enter a habit title");
      return;
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    console.log({ selectedHabit, selectedDays });
    const response = await fetch("/api/habit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: habitTitle, days: selectedDays }),
    });
    const data = await response.json();
    console.log(response, data);
    if (response.ok) {
      console.log("logged");
      router.refresh();
      router.push("/");
    }
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-base-300 p-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <Link href="/" className="btn btn-ghost gap-2 mb-6">
          <FaArrowLeft className="w-4 h-4" />
          BACK
        </Link>

        <form onSubmit={handleSubmit} className="card bg-neutral p-6">
          {/* Habit Input */}
          <div className="mb-6">
            <label className="text-lg mb-2 block">My new habit...</label>
            <input
              type="text"
              placeholder="Type here or choose below"
              className="input input-bordered w-full"
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>

          {/* Quick Select Habits */}
          <div className="flex flex-wrap gap-2 mb-6">
            {habitOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`badge badge-base-200 badge-lg cursor-pointer `}
                onClick={() => handleHabitSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Repeat Selector */}
          <div className="mb-6">
            <label className="text-lg mb-2 mr-4">Repeat</label>
            <select className="select select-bordered">
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>

          {/* Day Selector */}
          <div className="flex justify-between mb-6">
            {Object.entries(dayDisplayMap).map(([fullDay, shortDay]) => (
              <div key={fullDay} className="flex flex-col items-center">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(fullDay)}
                  onChange={() => toggleDay(fullDay)}
                  className="checkbox"
                />
                <span className="mt-1">{shortDay}</span>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn bg-[#05C26A] text-white btn-block"
          >
            CREATE HABIT
          </button>
        </form>
      </div>
    </div>
  );
}

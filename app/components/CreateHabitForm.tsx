"use client";

import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import Link from "next/link";

interface HabitOption {
  icon: string;
  label: string;
}

export default function CreateHabitForm() {
  const [inputValue, setInputValue] = useState("");
  const [selectedHabit, setSelectedHabit] = useState({
    icon: "",
    label: "",
  });
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

  const habitOptions: HabitOption[] = [
    { icon: "💪", label: "Workout" },
    { icon: "🇪🇸", label: "Learn Spanish" },
    { icon: "🇺🇸", label: "Learn English" },
    { icon: "🚭", label: "Stop smoking" },
    { icon: "📚", label: "Read" },
    { icon: "🇨🇳", label: "Learn Chinese" },
    { icon: "🚫", label: "No alcohol" },
    { icon: "🧘", label: "Meditate" },
    { icon: "💧", label: "Drink" },
    { icon: "🚶", label: "Walk" },
  ];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleHabitSelect = (option: HabitOption) => {
    setSelectedHabit(option);
    setInputValue(`${option.icon} ${option.label}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedHabit({ icon: "", label: "" }); // Clear selected habit when typing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ selectedHabit, selectedDays });
  };

  return (
    <div className="min-h-screen bg-base-300 p-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <Link href="#" className="btn btn-ghost gap-2 mb-6">
          <FaArrowLeft className="w-4 h-4" />
          BACK
        </Link>

        <form onSubmit={handleSubmit} className="card bg-base-200 p-6">
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
                key={option.label}
                type="button"
                className={`badge badge-lg badge-ghost badge-outline cursor-pointer ${
                  selectedHabit.label === option.label
                    ? "btn-primary"
                    : "btn-ghost"
                }`}
                onClick={() => handleHabitSelect(option)}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
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

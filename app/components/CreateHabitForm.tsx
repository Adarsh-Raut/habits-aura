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
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
  ]);

  const dayDisplayMap = {
    SUN: "S",
    MON: "M",
    TUE: "T",
    WED: "W",
    THU: "T",
    FRI: "F",
    SAT: "S",
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
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
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

    const habitTitle = inputValue.trim() || selectedHabit;

    if (!habitTitle) {
      alert("Please enter a habit name");
      return;
    }

    if (selectedDays.length === 0) {
      alert("Select at least one day");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/habit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: habitTitle,
          days: selectedDays,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create habit");
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
      });

      setTimeout(() => {
        router.refresh();
        router.push("/");
      }, 600);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen px-3 py-6 sm:p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="btn btn-ghost gap-2 mb-4 sm:mb-6 w-fit">
          <FaArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="card bg-neutral shadow-xl p-5 sm:p-6 space-y-6">
          <div>
            <label className="text-base sm:text-lg font-medium mb-2 block">
              My new habit
            </label>
            <input
              type="text"
              placeholder="Type here or choose below"
              className="input input-bordered w-full"
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {habitOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleHabitSelect(option)}
                  className="badge badge-base-200 badge-lg px-3 py-3 sm:py-2 cursor-pointer"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm sm:text-base font-medium mb-3 block">
              Days
            </label>
            <div className="grid grid-cols-7 gap-2 text-center">
              {Object.entries(dayDisplayMap).map(([fullDay, shortDay]) => (
                <label
                  key={fullDay}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(fullDay)}
                    onChange={() => toggleDay(fullDay)}
                    className="checkbox checkbox-sm sm:checkbox-md"
                  />
                  <span className="text-xs sm:text-sm text-gray-300">
                    {shortDay}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn bg-[#05C26A] text-white btn-block disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Habit"}
          </button>
        </div>
      </div>
    </form>
  );
}

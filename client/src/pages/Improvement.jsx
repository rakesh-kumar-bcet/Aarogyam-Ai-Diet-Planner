import React from "react";
import { useNavigate } from "react-router-dom";

export default function Improvement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Improve Your Health
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track progress, stay consistent, and make small improvements every
            week.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Progress Tracking
            </h2>
            <p className="text-gray-600 mb-4">
              Log your weight, meals, and energy levels regularly to see what
              works best.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Record weekly measurements</li>
              <li>Check meal compliance</li>
              <li>Review how you feel after each plan</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Healthy Habits
            </h2>
            <p className="text-gray-600 mb-4">
              Build routines around sleep, hydration, movement, and mindful
              eating.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Drink at least 2 liters of water</li>
              <li>Sleep 7-8 hours each night</li>
              <li>Include protein with every meal</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Nutrition Guidance
            </h2>
            <p className="text-gray-600 mb-4">
              Use your diet plan, consult nutritionists when needed, and adjust
              based on your goals.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Follow your generated meal plan</li>
              <li>Avoid foods listed under “Avoid”</li>
              <li>Ask a nutritionist for support</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            What to do next
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              1. Generate a new personalized plan if you don’t have one yet.
            </p>
            <p>
              2. Review your saved plans in My Plans and compare how you feel.
            </p>
            <p>
              3. If you notice a health warning, contact a nutritionist
              directly.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/generate-plan")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Generate Plan
            </button>
            <button
              onClick={() => navigate("/my-plans")}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              View My Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

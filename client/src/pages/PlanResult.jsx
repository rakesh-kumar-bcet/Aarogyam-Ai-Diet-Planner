import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PlanResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, healthAssessment } = location.state || {};
  const [showNutritionistOption, setShowNutritionistOption] = useState(false);

  useEffect(() => {
    if (!plan) {
      navigate("/generate-plan");
    }
  }, [plan, navigate]);

  if (!plan) {
    return null;
  }

  const { riskLevel, reasons } = healthAssessment || {
    riskLevel: "low",
    reasons: [],
  };

  const renderMealDetails = (meals) => {
    if (!meals) return null;
    if (Array.isArray(meals)) {
      return meals.map((meal, mIdx) => (
        <div key={mIdx} className="ml-4 text-gray-700">
          <p>
            <strong>{meal.type || `Meal ${mIdx + 1}`}:</strong>{" "}
            {meal.items || meal}
          </p>
        </div>
      ));
    }

    return Object.entries(meals).map(([mealType, mealValue], mIdx) => (
      <div key={mIdx} className="ml-4 text-gray-700">
        <p>
          <strong>
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}:
          </strong>{" "}
          {mealValue}
        </p>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Personalized Diet Plan
          </h1>
          <p className="text-gray-600">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Health Warning Section */}
        {riskLevel !== "low" && (
          <div
            className={`mb-6 rounded-lg p-6 border-l-4 ${
              riskLevel === "high"
                ? "bg-red-50 border-red-500"
                : "bg-yellow-50 border-yellow-500"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-2 ${
                riskLevel === "high" ? "text-red-800" : "text-yellow-800"
              }`}
            >
              {riskLevel === "high"
                ? "⚠️ Important Notice"
                : "ℹ️ Health Notice"}
            </h3>
            <p
              className={
                riskLevel === "high" ? "text-red-700" : "text-yellow-700"
              }
            >
              Based on your health information,{" "}
              {riskLevel === "high"
                ? "we strongly recommend consulting with a professional nutritionist for a personalized plan that addresses your specific health concerns."
                : "you may benefit from consulting with a nutritionist for personalized guidance."}
            </p>
            <p
              className={`mt-2 text-sm ${riskLevel === "high" ? "text-red-700" : "text-yellow-700"}`}
            >
              <strong>Factors:</strong> {reasons.join(", ")}
            </p>
            <button
              onClick={() => setShowNutritionistOption(true)}
              className={`mt-4 px-6 py-2 rounded-lg font-semibold text-white transition ${
                riskLevel === "high"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              Find a Nutritionist →
            </button>
          </div>
        )}

        {/* Plan Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Daily Calories
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {plan.dailyCalories || 2000}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Protein Goal
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {plan.proteinGoal || 120}g
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Plan Duration
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {plan.duration || 4} weeks
              </p>
            </div>
          </div>

          {/* Preferred Foods */}
          {plan.prefer && plan.prefer.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ✅ Foods to Prefer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.prefer.map((food, idx) => (
                  <div
                    key={idx}
                    className="bg-green-50 p-4 rounded-lg border border-green-200"
                  >
                    <p className="text-gray-800">{food}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Foods to Avoid */}
          {plan.avoid && plan.avoid.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ❌ Foods to Avoid
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.avoid.map((food, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50 p-4 rounded-lg border border-red-200"
                  >
                    <p className="text-gray-800">{food}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plan */}
          {plan.weekly && plan.weekly.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📅 Weekly Schedule
              </h2>
              <div className="space-y-4">
                {plan.weekly.map((day, idx) => (
                  <details
                    key={idx}
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer"
                  >
                    <summary className="font-bold text-gray-800 hover:text-blue-600">
                      {day.day || `Day ${idx + 1}`}
                    </summary>
                    <div className="mt-4 space-y-2">
                      {renderMealDetails(day.meals)}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {plan.notes && plan.notes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📝 Important Notes
              </h2>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <ul className="space-y-2">
                  {plan.notes.map((note, idx) => (
                    <li key={idx} className="text-gray-800 flex items-start">
                      <span className="text-blue-600 mr-3">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/my-plans")}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
          >
            View My Plans
          </button>
          {riskLevel !== "low" && (
            <button
              onClick={() => setShowNutritionistOption(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
            >
              Contact Nutritionist
            </button>
          )}
        </div>

        {/* Nutritionist Modal */}
        {showNutritionistOption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Connect with a Nutritionist
              </h2>
              <p className="text-gray-600 mb-6">
                Based on your health assessment, a nutritionist can provide
                personalized guidance. How would you like to connect?
              </p>
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    navigate("/nutritionist-directory");
                    setShowNutritionistOption(false);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                >
                  💬 Chat with Nutritionist
                </button>
                <button
                  onClick={() => {
                    navigate("/nutritionist-directory");
                    setShowNutritionistOption(false);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
                >
                  📞 Call Nutritionist
                </button>
              </div>
              <button
                onClick={() => setShowNutritionistOption(false)}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

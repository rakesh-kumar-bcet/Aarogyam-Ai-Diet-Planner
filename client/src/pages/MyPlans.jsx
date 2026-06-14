import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDietHistory } from "../Services/dietService";

export default function MyPlans() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getDietHistory();
        if (res && Array.isArray(res)) {
          setHistory(res);
        } else {
          setHistory([]);
          setMsg(res?.message || "No plans found.");
        }
      } catch (error) {
        console.error("Failed to load diet history:", error);
        setMsg(error.message || "Unable to load your plans.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            My Plans & History
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review your saved diet plans, track progress, and return to the plan
            page at any time.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={() => navigate("/generate-plan")}
            className="w-full md:w-60 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Generate a New Plan
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading your plans...</div>
        ) : history.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              No saved plans yet
            </h2>
            <p className="text-gray-600 mb-4">
              Start by generating a new diet plan tailored to your goals and
              health profile.
            </p>
            <button
              onClick={() => navigate("/generate-plan")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Generate Plan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => (
              <div
                key={entry._id}
                className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Plan from {new Date(entry.createdAt).toLocaleDateString()}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Calories: {entry.plan.dailyCalories}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    Submitted:{" "}
                    {new Date(entry.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-sm text-gray-600">Preferred Foods</p>
                    <ul className="mt-3 text-gray-800 list-disc list-inside">
                      {(entry.plan.prefer || [])
                        .slice(0, 3)
                        .map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl">
                    <p className="text-sm text-gray-600">Avoid Foods</p>
                    <ul className="mt-3 text-gray-800 list-disc list-inside">
                      {(entry.plan.avoid || []).slice(0, 3).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <p className="text-sm text-gray-600">Notes</p>
                    <ul className="mt-3 text-gray-800 list-disc list-inside">
                      {(entry.plan.notes || []).slice(0, 3).map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(entry.plan.weekly || []).map((day, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {day.day || `Day ${idx + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <strong>Breakfast:</strong>{" "}
                        {day.meals?.breakfast || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Lunch:</strong> {day.meals?.lunch || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Dinner:</strong> {day.meals?.dinner || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Snacks:</strong> {day.meals?.snacks || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {msg && (
          <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-gray-700 border border-yellow-200">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

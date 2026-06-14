import React, { useState, useEffect } from "react";
import { logCalories, getCalorieLogs } from "../Services/calorieService";

export default function Calories() {
  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState("");
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await getCalorieLogs();
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Error fetching calorie logs", err);
      setMsg(err.message || "Unable to load logs.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!meal || !calories || isNaN(Number(calories))) {
      setMsg("Please provide meal name and numeric calories.");
      return;
    }
    setLoading(true);
    try {
      await logCalories(meal, Number(calories));
      setMsg("Log saved.");
      setMeal("");
      setCalories("");
      await fetchLogs();
    } catch (err) {
      console.error("Failed to log calories", err);
      setMsg(err.message || "Failed to add log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Calorie Tracker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Meal description"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full border p-2 rounded"
          />
          {msg && <p className="text-red-500">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {loading ? "Logging..." : "Add Log"}
          </button>
        </form>
      </div>

      <div className="mt-6 w-full max-w-md bg-white p-6 rounded shadow-md">
        <h3 className="text-xl mb-2">Today's Logs ({total} cal)</h3>
        {logs.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <ul className="list-disc ml-6 space-y-1">
            {logs.map((log) => (
              <li key={log._id || log.id}>
                {log.meal} - {log.calories} cal
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

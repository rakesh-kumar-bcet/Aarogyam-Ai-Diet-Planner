import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { getLastPlan } from "../Services/dietService";

export default function DietPlan() {
  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    activity: "low",
    goal: "maintain",
    conditions: "",
  });

  const [msg, setMsg] = useState("");
  const [diet, setDiet] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const [loading, setLoading] = useState(false);

  const location = useLocation();

  // if navigated with a plan already generated (e.g. from Dashboard), show it
  useEffect(() => {
    if (location.state && location.state.plan) {
      console.log("Received plan via navigation state", location.state.plan);
      setDiet(location.state.plan);
      setShowForm(false);
    }
  }, [location.state]);

  // grab token once at top so it can be used in effects
  const token = localStorage.getItem("token");

  // automatically load last saved plan when page opens
  useEffect(() => {
    const loadLast = async () => {
      try {
        const res = await getLastPlan();
        // backend returns either { message: 'No diet plan found' } or the plan object
          if (res && !res.message) {
            setDiet(res);
            // hide the form when an existing plan is found
            setShowForm(false);
          } else {
            setDiet(null);
            setShowForm(true);
          }
      } catch (err) {
        console.error('Failed to load last diet plan:', err);
        setMsg(err.message || 'Unable to load your last diet plan.');
      } finally {
      }
    };
    loadLast();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered", form, "token", token);

    if (!token) {
      setMsg("You must be logged in to generate a diet plan.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/diet/plan`,
        {
          age: Number(form.age),
          weight: Number(form.weight),
          height: Number(form.height),
          gender: form.gender,
          activity: form.activity,
          goal: form.goal,
          conditions: form.conditions
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Plan response", res.data);
      setDiet(res.data);
      setMsg("Diet plan generated successfully!");
    } catch (err) {
      console.error("Failed to generate plan:", err.response?.data || err.message);
      setMsg(err.response?.data?.message || "Failed to generate plan.");
      setDiet(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4">
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
        >
        <h2 className="text-2xl mb-6">Generate Diet Plan</h2>

        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="mb-4 w-full p-2 border"
        />

        <input
          name="weight"
          type="number"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={handleChange}
          className="mb-4 w-full p-2 border"
        />

        <input
          name="height"
          type="number"
          placeholder="Height (cm)"
          value={form.height}
          onChange={handleChange}
          className="mb-4 w-full p-2 border"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="mb-4 w-full p-2 border"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select
          name="activity"
          value={form.activity}
          onChange={handleChange}
          className="mb-4 w-full p-2 border"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          name="goal"
          value={form.goal}
          onChange={handleChange}
          className="mb-4 w-full p-2 border"
        >
          <option value="lose">Lose Weight</option>
          <option value="gain">Gain Weight</option>
          <option value="maintain">Maintain</option>
        </select>

        <input
          name="conditions"
          placeholder="Medical conditions (comma separated)"
          value={form.conditions}
          onChange={handleChange}
          className="mb-4 w-full p-2 border"
        />

        {msg && <p className="text-red-500 mb-2">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
        </form>
      )}

      {diet && (
        <div className="mt-6 p-4 bg-white rounded shadow-md w-full max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl">Your Diet Plan</h3>
            <button
              className="text-sm text-blue-600 underline"
              onClick={() => setShowForm(true)}
            >
              Generate New Plan
            </button>
          </div>
              <p className="mb-2">Daily Calories: {diet.dailyCalories}</p>
          {diet.macros && (
            <p className="mb-2">
              Protein: {diet.macros.protein}g, Carbs: {diet.macros.carbs}g, Fat: {diet.macros.fat}g
            </p>
          )}

          {diet.notes && diet.notes.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
              <h4 className="font-semibold">Notes for your conditions</h4>
              <ul className="list-disc ml-6">
                {diet.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {diet.weekly && (
            <div className="mt-4">
              {diet.weekly.map((dayPlan, idx) => (
                <div key={idx} className="mb-4">
                  <h4 className="font-semibold">{dayPlan.day}</h4>
                  <ul className="list-disc ml-6">
                    <li>Breakfast: {dayPlan.meals.breakfast}</li>
                    <li>Lunch: {dayPlan.meals.lunch}</li>
                    <li>Dinner: {dayPlan.meals.dinner}</li>
                    <li>Snacks: {dayPlan.meals.snacks}</li>
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* If the component mounted and no plan is available, show a helpful message */}
      {!diet && (
        <p className="mt-6 text-center text-gray-600">
          {token
            ? 'No saved plan yet – generate one using the form above.'
            : 'Please log in to view your diet plan.'}
        </p>
      )}
    </div>
  );
}

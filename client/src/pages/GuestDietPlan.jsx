import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GuestDietPlan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    goal: "weight_loss",
    activityLevel: "moderate"
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (plan) {
      // Show modal after 1 second delay
      const timer = setTimeout(() => setShowModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate generating a diet plan (you can call your API here)
      // For now, we'll create a basic plan
      const generatedPlan = {
        name: formData.name,
        goal: formData.goal,
        meals: [
          {
            meal: "Breakfast",
            foods: ["Oatmeal with berries", "Greek yogurt", "Green tea"],
            calories: 350
          },
          {
            meal: "Lunch",
            foods: ["Grilled chicken breast", "Brown rice", "Steamed vegetables"],
            calories: 500
          },
          {
            meal: "Snack",
            foods: ["Apple with almond butter", "Water"],
            calories: 200
          },
          {
            meal: "Dinner",
            foods: ["Baked salmon", "Sweet potato", "Broccoli"],
            calories: 550
          }
        ],
        totalCalories: 1600,
        duration: "1 week"
      };
      
      // Save user weight to localStorage and mark as explicitly provided
      localStorage.setItem("weight", formData.weight);
      localStorage.setItem("weightProvided", "true");
      
      setPlan(generatedPlan);
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="float-right text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>

              {/* Modal Content */}
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Premium Features!</h2>
                <p className="text-gray-600 mb-6">Create an account to access exclusive features designed to transform your health journey.</p>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-green-500 flex-shrink-0">👨‍⚕️</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Connect with Nutritionists</h3>
                      <p className="text-sm text-gray-600">Get expert advice and personalized guidance from certified nutritionists</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-blue-500 flex-shrink-0">💪</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Fitness Improvement</h3>
                      <p className="text-sm text-gray-600">Track workouts, get exercise recommendations, and monitor your progress</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-yellow-500 flex-shrink-0">📊</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Save & Track Progress</h3>
                      <p className="text-sm text-gray-600">Save all your plans and track your health metrics over time</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-purple-500 flex-shrink-0">📱</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Daily Reminders & Updates</h3>
                      <p className="text-sm text-gray-600">Stay motivated with personalized reminders and nutrition tips</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      navigate("/register");
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Create Account Now
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-4">Already have an account? <button onClick={() => { setShowModal(false); navigate("/login"); }} className="text-blue-600 hover:text-blue-800 font-semibold">Sign In</button></p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto mt-8">
          {/* Plan Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Your Personalized Diet Plan</h1>
                <p className="text-gray-600 mt-2">Guest Plan for {plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Total Calories</p>
                <p className="text-3xl font-bold text-green-500">{plan.totalCalories}</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Goal:</strong> {plan.goal.replace(/_/g, ' ').toUpperCase()}</p>
              <p className="text-gray-700"><strong>Duration:</strong> {plan.duration}</p>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-4 mb-8">
            {plan.meals.map((mealItem, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">{mealItem.meal}</h3>
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    {mealItem.calories} cal
                  </span>
                </div>
                <ul className="space-y-2">
                  {mealItem.foods.map((food, foodIdx) => (
                    <li key={foodIdx} className="text-gray-700 flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      {food}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setPlan(null)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
            >
              Generate New Plan
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              Create Account & Save
            </button>
          </div>

          {/* Info Message */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800">
              <strong>Note:</strong> This plan is temporary and won't be saved. Create an account to save your plans and track progress!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Diet Plan (Guest Mode)</h1>
          <p className="text-gray-600 mb-8">Fill in your details to generate a personalized meal plan</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Age, Weight, Height */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="Years"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Weight *</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  placeholder="kg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Height *</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Goal *</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="muscle_building">Muscle Building</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Activity Level *</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="sedentary">Sedentary (little exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Very Active (6-7 days/week)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "Generating..." : "Generate Plan"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth-entry")}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <p className="text-purple-800">
              <strong>Create an account</strong> to save your plans, track progress, and get AI-powered recommendations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Register.jsx
import React, { useState } from "react";
import {
  registerUser,
  completeNutritionistProfile,
} from "../Services/authService";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [step, setStep] = useState(1); // 1: role selection, 2: basic registration, 3: nutritionist details (if needed)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [nutritionistForm, setNutritionistForm] = useState({
    degree: "",
    specialization: "",
    phone: "",
    contactPreference: ["chat"],
  });
  const [msg, setMsg] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setForm({ ...form, role: selectedRole });
    setStep(2);
  };

  const handleBasicChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNutritionistChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setNutritionistForm((prev) => ({
        ...prev,
        contactPreference: checked
          ? [...prev.contactPreference, value]
          : prev.contactPreference.filter((pref) => pref !== value),
      }));
    } else {
      setNutritionistForm({ ...nutritionistForm, [name]: value });
    }
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.userId);
      localStorage.setItem("role", res.role || "user");
      localStorage.setItem("userName", res.name || form.name);
      localStorage.setItem("name", res.name || form.name);
      // store email for profile prefill
      localStorage.setItem("email", form.email || "");

      // Show welcome alert
      alert(
        `Welcome ${form.name}! 👋 Your account has been created successfully.`,
      );

      if (res.role === "nutrenist") {
        setUserId(res.userId);
        setStep(3); // Go to nutritionist details step
      } else {
        sessionStorage.setItem("welcomeShown", "true");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
      setMsg(err.response?.data?.message || "Register failed");
    }
  };

  const handleNutritionistSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!nutritionistForm.degree || !nutritionistForm.phone) {
        setMsg("Degree and phone are required");
        return;
      }

      await completeNutritionistProfile(userId, nutritionistForm);
      localStorage.setItem("isProfileComplete", "true");
      sessionStorage.setItem("nutritionistWelcomeShown", "true");

      alert(
        `Welcome to the Nutritionist Network! 👋 Your profile is complete.`,
      );

      navigate("/nutrenist");
    } catch (err) {
      console.error(
        "Profile completion failed:",
        err.response?.data || err.message,
      );
      setMsg(err.response?.data?.message || "Profile completion failed");
    }
  };

  // Step 1: Role Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Create Your Account
            </h1>
            <p className="text-gray-600 text-lg">Choose your account type</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Card */}
            <div
              onClick={() => handleRoleSelect("user")}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
            >
              <div className="text-4xl mb-4 text-blue-500">👤</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">User</h2>
              <p className="text-gray-600 mb-6">
                I want personalized diet plans and tracking
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg">
                Continue as User
              </button>
            </div>

            {/* Nutritionist Card */}
            <div
              onClick={() => handleRoleSelect("nutrenist")}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
            >
              <div className="text-4xl mb-4 text-green-500">🩺</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nutritionist
              </h2>
              <p className="text-gray-600 mb-6">
                I offer nutrition counseling services
              </p>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg">
                Continue as Nutritionist
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/auth-entry")}
              className="text-gray-600 hover:text-gray-800 font-medium underline"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Basic Registration
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <form
          onSubmit={handleBasicSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Register as {form.role === "user" ? "User" : "Nutritionist"}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleBasicChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleBasicChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter a strong password"
              value={form.password}
              onChange={handleBasicChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {msg && <p className="text-red-500 mb-4 text-center">{msg}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded-lg transition-colors mb-4"
          >
            Continue
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-gray-600 hover:text-gray-800 font-medium underline"
          >
            ← Back to Role Selection
          </button>
        </form>
      </div>
    );
  }

  // Step 3: Nutritionist Profile (only shown for nutritionists)
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <form
          onSubmit={handleNutritionistSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 mb-6">Add your professional details</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Degree*
            </label>
            <input
              name="degree"
              placeholder="e.g., B.Sc Nutrition, M.D Dietetics"
              value={nutritionistForm.degree}
              onChange={handleNutritionistChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              name="specialization"
              placeholder="e.g., Sports Nutrition, Diabetes Management"
              value={nutritionistForm.specialization}
              onChange={handleNutritionistChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone*
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={nutritionistForm.phone}
              onChange={handleNutritionistChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Contact Methods
            </label>
            <div className="space-y-2">
              {["message", "call"].map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    name={method}
                    value={method}
                    checked={nutritionistForm.contactPreference.includes(
                      method,
                    )}
                    onChange={handleNutritionistChange}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <span className="ml-2 text-gray-700 capitalize">
                    {method}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {msg && <p className="text-red-500 mb-4 text-center">{msg}</p>}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold p-3 rounded-lg transition-colors"
          >
            Complete Profile
          </button>
        </form>
      </div>
    );
  }
}

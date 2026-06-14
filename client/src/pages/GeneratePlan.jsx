import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePlan } from "../Services/dietService";

export default function GeneratePlan() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [formData, setFormData] = useState({
    age: "",
    weight: "", // in kg
    height: "", // in cm
    gender: "",
    activity: "moderate",
    dietaryRestrictions: [],
    healthConditions: [],
    medications: "",
    allergies: "",
    goal: "balanced", // balanced, weight-loss, weight-gain, muscle-building
    dietPreference: "balanced", // vegan, vegetarian, balanced, etc.
  });

  const healthConditionOptions = [
    "diabetes",
    "hypertension",
    "heart-disease",
    "obesity",
    "thyroid",
    "pcos",
    "kidney-disease",
    "none",
  ];

  const dietaryRestrictionOptions = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "low-sodium",
    "low-sugar",
    "none",
  ];

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      return (weight / (height / 100) ** 2).toFixed(1);
    }
    return 0;
  };

  const assessHealthRisk = () => {
    let riskLevel = "low";
    let reasons = [];

    const bmi = parseFloat(calculateBMI(formData.weight, formData.height));

    if (bmi >= 30) {
      riskLevel = "high";
      reasons.push("High BMI (Obese)");
    } else if (bmi >= 25) {
      riskLevel = "medium";
      reasons.push("Overweight BMI");
    }

    if (
      formData.healthConditions.length > 0 &&
      !formData.healthConditions.includes("none")
    ) {
      if (riskLevel === "low") riskLevel = "medium";
      if (riskLevel === "medium" && formData.healthConditions.length > 2)
        riskLevel = "high";
      reasons.push(
        `Health conditions: ${formData.healthConditions.join(", ")}`,
      );
    }

    return { riskLevel, reasons };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "healthConditions" && value === "none") {
        setFormData((prev) => ({
          ...prev,
          healthConditions: checked ? ["none"] : [],
        }));
        return;
      }
      if (name === "dietaryRestrictions" && value === "none") {
        setFormData((prev) => ({
          ...prev,
          dietaryRestrictions: checked ? ["none"] : [],
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? prev[name]
              .concat(value)
              .filter((item, index, arr) => item !== "none" || arr.length === 1)
          : prev[name].filter((item) => item !== value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGeneratePlan = async () => {
    if (!formData.age || !formData.weight || !formData.height) {
      setMsg("Please fill in age, weight, and height");
      return;
    }

    setLoading(true);
    try {
      const { riskLevel, reasons } = assessHealthRisk();

      const planData = {
        ...formData,
        conditions: formData.healthConditions,
        dietaryRestrictions: formData.dietaryRestrictions,
        bmi: calculateBMI(formData.weight, formData.height),
        healthRiskLevel: riskLevel,
        consultationReason: reasons.join(", "),
      };

      // Save user weight to localStorage and mark as explicitly provided
      localStorage.setItem("weight", formData.weight);
      localStorage.setItem("weightProvided", "true");

      const response = await generatePlan(planData);

      // Pass plan data through navigation state for display on result page
      navigate("/plan-result", {
        state: { plan: response, healthAssessment: { riskLevel, reasons } },
      });
    } catch (err) {
      setMsg(err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Health Info
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Generate Your Diet Plan
              </h1>
              <p className="text-gray-600">
                Step 1 of 3: Basic Health Information
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "33.33%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (years)*
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g., 25"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender*
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)*
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g., 70"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)*
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g., 170"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {formData.weight && formData.height && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Your BMI:</strong>{" "}
                    {calculateBMI(formData.weight, formData.height)}
                    {parseFloat(
                      calculateBMI(formData.weight, formData.height),
                    ) < 18.5 && " (Underweight)"}
                    {parseFloat(
                      calculateBMI(formData.weight, formData.height),
                    ) >= 18.5 &&
                      parseFloat(
                        calculateBMI(formData.weight, formData.height),
                      ) < 25 &&
                      " (Normal)"}
                    {parseFloat(
                      calculateBMI(formData.weight, formData.height),
                    ) >= 25 &&
                      parseFloat(
                        calculateBMI(formData.weight, formData.height),
                      ) < 30 &&
                      " (Overweight)"}
                    {parseFloat(
                      calculateBMI(formData.weight, formData.height),
                    ) >= 30 && " (Obese)"}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <select
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sedentary">
                    Sedentary (little to no exercise)
                  </option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="veryActive">
                    Very Active (intense training)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Goal
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="balanced">Balanced diet</option>
                  <option value="weight-loss">Weight loss</option>
                  <option value="weight-gain">Weight gain</option>
                  <option value="muscle-building">Muscle building</option>
                </select>
              </div>

              {msg && <p className="text-red-500 text-center">{msg}</p>}

              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Health Conditions & Restrictions
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Generate Your Diet Plan
              </h1>
              <p className="text-gray-600">
                Step 2 of 3: Health & Dietary Information
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "66.66%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Health Conditions (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {healthConditionOptions.map((condition) => (
                    <label key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        name="healthConditions"
                        value={condition}
                        checked={formData.healthConditions.includes(condition)}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500 rounded"
                      />
                      <span className="ml-2 text-gray-700 capitalize">
                        {condition.replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dietary Restrictions (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {dietaryRestrictionOptions.map((restriction) => (
                    <label key={restriction} className="flex items-center">
                      <input
                        type="checkbox"
                        name="dietaryRestrictions"
                        value={restriction}
                        checked={formData.dietaryRestrictions.includes(
                          restriction,
                        )}
                        onChange={handleChange}
                        className="w-4 h-4 text-green-500 rounded"
                      />
                      <span className="ml-2 text-gray-700 capitalize">
                        {restriction.replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medications
                </label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  placeholder="List any medications you're taking (optional)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="List any food allergies (optional)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Review & Generate
  if (currentStep === 3) {
    const { riskLevel, reasons } = assessHealthRisk();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Generate Your Diet Plan
              </h1>
              <p className="text-gray-600">Step 3 of 3: Review & Generate</p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            {riskLevel === "high" && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  ⚠️ Health Alert
                </h3>
                <p className="text-red-700">
                  Based on your health assessment, we recommend consulting with
                  a professional nutritionist for a personalized plan.
                </p>
                <p className="text-red-700 mt-2">
                  <strong>Reasons:</strong> {reasons.join(", ")}
                </p>
              </div>
            )}

            {riskLevel === "medium" && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">
                  ℹ️ Health Notice
                </h3>
                <p className="text-yellow-700">
                  You may benefit from consulting with a nutritionist.
                </p>
                <p className="text-yellow-700 mt-2">
                  <strong>Reasons:</strong> {reasons.join(", ")}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">
                  <strong>BMI:</strong>
                </span>
                <span className="text-gray-900">
                  {calculateBMI(formData.weight, formData.height)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">
                  <strong>Goal:</strong>
                </span>
                <span className="text-gray-900 capitalize">
                  {formData.goal.replace("-", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">
                  <strong>Activity Level:</strong>
                </span>
                <span className="text-gray-900 capitalize">
                  {formData.activityLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">
                  <strong>Health Risk Level:</strong>
                </span>
                <span
                  className={`capitalize font-bold ${
                    riskLevel === "high"
                      ? "text-red-600"
                      : riskLevel === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {riskLevel}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Plan"}
              </button>
            </div>

            {msg && <p className="text-red-500 text-center mt-4">{msg}</p>}
          </div>
        </div>
      </div>
    );
  }
}

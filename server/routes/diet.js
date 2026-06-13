// server/routes/diet.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const DietHistory = require("../models/DietHistory");
const { verifyToken } = require("../middleware/authMiddleware");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiApiKey = process.env.GEMINI_API_KEY;
const useGemini = Boolean(geminiApiKey && geminiApiKey !== "your-free-gemini-api-key-here");

let model;
if (useGemini) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
} else {
  console.warn(
    "Gemini API key is missing or placeholder. Gemini AI will be skipped and fallback diet plans will be used."
  );
}

/* =========================
   GENERATE DIET PLAN WITH GEMINI
========================= */
router.post("/plan", verifyToken, async (req, res) => {
  try {
    // ✅ Get user ID from JWT, not from request body
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { age, weight, height, gender, activity, goal, conditions, otherCondition } = req.body;

    if (!age || !weight || !height || !gender)
      return res.status(400).json({ message: "Missing required fields" });

    // 🧠 Calculate BMR using Mifflin-St Jeor equations
    const weightKg = Number(weight);
    const heightCm = Number(height);
    const ageYears = Number(age);
    let bmr;
    if (gender === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }

    // activity factor
    const activityFactor =
      activity === "sedentary" ? 1.2 :
      activity === "light" ? 1.375 :
      activity === "moderate" ? 1.55 :
      activity === "active" ? 1.725 :
      activity === "veryActive" ? 1.9 : 1.2;

    let dailyCalories = Math.round(bmr * activityFactor);
    const planGoal =
      goal === "weight-loss" || goal === "lose" ? "lose" :
      goal === "weight-gain" || goal === "gain" ? "gain" :
      goal === "muscle-building" ? "muscle" :
      "maintain";

    if (planGoal === "lose") dailyCalories -= 500;
    else if (planGoal === "gain") dailyCalories += 500;
    else if (planGoal === "muscle") dailyCalories += 250;

    // simple macronutrient breakdown (percentages)
    const macros = {
      protein: Math.round(dailyCalories * 0.25 / 4), // grams
      carbs: Math.round(dailyCalories * 0.50 / 4),
      fat: Math.round(dailyCalories * 0.25 / 9),
    };

    // 🤖 Generate personalized plan using Gemini AI
    const conditionsList = conditions && Array.isArray(conditions) ? conditions.join(", ") : "none";
    const geminiPrompt = `Create a personalized 7-day meal plan with the following criteria:
- Age: ${ageYears} years
- Weight: ${weightKg} kg
- Height: ${heightCm} cm
- Gender: ${gender}
- Activity Level: ${activity}
- Goal: ${goal === "lose" ? "Weight Loss" : goal === "gain" ? "Weight Gain" : "Weight Maintenance"}
- Daily Calories: ${dailyCalories}
- Protein: ${macros.protein}g, Carbs: ${macros.carbs}g, Fat: ${macros.fat}g
- Medical Conditions: ${conditionsList}
${otherCondition ? `- Other Conditions: ${otherCondition}` : ""}

Please provide:
1. A 7-day meal plan (breakfast, lunch, dinner, snacks for each day)
2. Key nutritional notes for the conditions
3. Foods to avoid
4. Foods to prefer
5. Quick workout suggestions (optional)

Format the response as JSON with this structure:
{
  "weeklyPlan": [{"day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "...", "snacks": "..."}, ...],
  "notes": ["note1", "note2"],
  "avoid": ["food1", "food2"],
  "prefer": ["food1", "food2"],
  "workoutPlan": ["suggestion1"]
}`;

    let geminiResponse;
    let weekly = [];
    let notes = [];
    let avoid = [];
    let prefer = [];
    let workoutPlan = [];

    if (model) {
      try {
        const result = await model.generateContent(geminiPrompt);
        const text = result.response.text();

        // Parse JSON from Gemini response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          geminiResponse = JSON.parse(jsonMatch[0]);

          // Map Gemini response to our format
          weekly = (geminiResponse.weeklyPlan || []).map(day => ({
            day: day.day || "Day",
            meals: {
              breakfast: day.breakfast || "Oatmeal with berries",
              lunch: day.lunch || "Grilled chicken salad",
              dinner: day.dinner || "Baked fish with veggies",
              snacks: day.snacks || "Apple and nuts"
            }
          }));

          notes = geminiResponse.notes || [];
          avoid = geminiResponse.avoid || [];
          prefer = geminiResponse.prefer || [];
          workoutPlan = geminiResponse.workoutPlan || [];
        }
      } catch (geminiErr) {
        const message = String(geminiErr.message || geminiErr);
        console.warn("Gemini API error, using fallback:", message);
        notes.push("Gemini AI unavailable; using standard meal plan fallback.");
      }
    } else {
      notes.push("Gemini API not configured, using local fallback meal plan.");
    }

    // Fallback meal generation if Gemini didn't return data
    if (weekly.length === 0) {
      const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const sampleMeals = {
        breakfast: [
          "Oatmeal with berries",
          "Greek yogurt with honey and nuts",
          "Whole grain toast with avocado",
          "Smoothie (banana, spinach, protein powder)",
        ],
        lunch: [
          "Grilled chicken salad",
          "Brown rice bowl with vegetables",
          "Turkey sandwich on whole wheat",
          "Quinoa salad with beans",
        ],
        dinner: [
          "Baked fish with steamed veggies",
          "Stir-fry tofu and vegetables",
          "Lentil soup with whole grain bread",
          "Pasta with marinara sauce and salad",
        ],
        snacks: [
          "Apple and peanut butter",
          "Carrot sticks with hummus",
          "Handful of almonds",
          "Protein bar",
        ],
      };

      weekly = weekDays.map((day, idx) => ({
        day,
        meals: {
          breakfast: sampleMeals.breakfast[idx % sampleMeals.breakfast.length],
          lunch: sampleMeals.lunch[idx % sampleMeals.lunch.length],
          dinner: sampleMeals.dinner[idx % sampleMeals.dinner.length],
          snacks: sampleMeals.snacks[idx % sampleMeals.snacks.length],
        },
      }));
    }

    // Apply condition-based adjustments if Gemini didn't provide them
    if (notes.length === 0 && conditions && Array.isArray(conditions)) {
      conditions.forEach((cond) => {
        const c = cond.toLowerCase();
        if (c === "diabetes") {
          notes.push("Low sugar options recommended");
        }
        if (c === "hypertension") {
          notes.push("Low sodium diet suggested");
        }
        if (c === "kidney disease") {
          notes.push("Limit potassium and phosphorus");
        }
        if (c === "pregnancy") {
          notes.push("Ensure adequate folate and iron");
        }
        if (c === "allergy") {
          notes.push("Avoid known allergens");
        }
      });
    }

    if (otherCondition && !notes.some(n => n.includes(otherCondition))) {
      notes.push(`Consider condition: ${otherCondition}`);
    }

    const plan = {
      dailyCalories,
      macros,
      weekly,
      notes,
      avoid: avoid.length > 0 ? avoid : ["Processed foods", "Sugary drinks", "Fried foods"],
      prefer: prefer.length > 0 ? prefer : ["Whole grains", "Lean proteins", "Fresh vegetables"],
      workoutPlan: workoutPlan.length > 0 ? workoutPlan : ["30 min cardio", "Strength training 3x/week"],
    };

    // Save plan to history
    await DietHistory.create({
      user: userId,
      input: req.body,
      plan
    });

    res.json(plan);

  } catch (err) {
    console.error("Generate diet plan error:", err);
    res.status(500).json({ message: "Failed to generate diet plan" });
  }
});

/* =========================
   GET DIET HISTORY / LAST PLAN
========================= */
// return the full history of plans (array) or a simple message when none
router.get("/history", verifyToken, async (req, res) => {
  try {
    const history = await DietHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    if (!history || history.length === 0) {
      return res.json({ message: "No diet plans found" });
    }

    // return array of records (each contains { user, input, plan, createdAt })
    res.json(history);
  } catch (err) {
    console.error("Get diet history error:", err);
    res.status(500).json({ message: "Error fetching diet history" });
  }
});

// convenience endpoint used by frontend to get only the most recent plan
router.get("/last", verifyToken, async (req, res) => {
  try {
    const entry = await DietHistory.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    if (!entry) return res.json({ message: "No diet plan found" });

    res.json(entry.plan);
  } catch (err) {
    console.error("Get last plan error:", err);
    res.status(500).json({ message: "Error fetching last plan" });
  }
});

module.exports = router;

# 🚀 Gemini AI Integration Setup

## Overview
Your AI Diet Planner now uses **Google's Gemini AI** (free tier) to generate personalized diet plans with AI-powered meal planning!

## ✨ Features
- **AI-Powered Meal Planning**: Gemini generates customized meals based on:
  - Age, weight, height, gender
  - Activity level & fitness goal
  - Caloric needs (calculated via BMR)
  - Medical conditions (diabetes, hypertension, kidney disease, pregnancy, allergies)
  - Custom health notes
  
- **Smart Recommendations**:
  - Foods to avoid
  - Foods to prefer
  - Workout suggestions
  - Condition-specific notes

## 🔑 Get Your Free Gemini API Key

Google offers **free API calls** for Gemini (with fair-use limits).

### Steps:

1. **Go to Google AI Studio** 
   - Visit: https://ai.google.dev/

2. **Click "Get API Key"** (or Sign in if needed)
   - Google account required
   - Free tier: 15 requests/minute, up to 1,500,000 tokens/month

3. **Create or select a project**
   - Create a new project or use existing one

4. **Copy your API Key**
   - It will look like: `AIzaSyD...`

5. **Add to `.env` file**
   ```env
   GEMINI_API_KEY=AIzaSyD...
   ```

---

## 📝 Configuration

### Server `.env` file
Located at: `/server/.env`

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai_diet_planner
JWT_SECRET=supersecret-key
JWT_EXPIRE=1d
OPENAI_API_KEY=sk-abc123xxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyD...  # ← Add your Gemini API key here
```

### Installation
The package is already installed:
```bash
cd server
npm install @google/generative-ai
```

---

## 🔄 How It Works

### Request Flow
1. User submits health info (age, weight, height, conditions, etc.)
2. Server calculates BMR & daily calories
3. **Gemini AI** generates personalized 7-day meal plan
4. Plan includes:
   - Breakfast, lunch, dinner, snacks for each day
   - Macronutrient breakdown (P/C/F)
   - Medical condition notes
   - Foods to avoid/prefer
   - Workout recommendations
5. Plan is saved to MongoDB for history

### Fallback System
- If Gemini API fails (network, quota), system falls back to basic meal plan
- Users still get functional diet plans even without Gemini

---

## 📊 API Response Example

```json
{
  "dailyCalories": 2200,
  "macros": {
    "protein": 137,
    "carbs": 275,
    "fat": 61
  },
  "weekly": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": "Oatmeal with berries and almonds",
        "lunch": "Grilled chicken salad with olive oil dressing",
        "dinner": "Baked salmon with roasted vegetables",
        "snacks": "Apple with almond butter"
      }
    },
    ...
  ],
  "notes": ["Low sugar options recommended", "Ensure adequate folate"],
  "avoid": ["Processed foods", "Sugary drinks", "Fried foods"],
  "prefer": ["Whole grains", "Lean proteins", "Fresh vegetables"],
  "workoutPlan": ["30 min cardio", "Strength training 3x/week"]
}
```

---

## 🧪 Testing

### Test the integration:

```bash
cd server
npm install  # Install Gemini SDK
npm start    # Start server

# Then in another terminal:
cd client
npm start    # Start React app
```

1. **Register** a new account
2. **Login** 
3. Go to **Dashboard**
4. Fill in your health info
5. Click **"Generate Plan"**
6. Gemini will generate your personalized meal plan! ✨

---

## ⚠️ Important Notes

### Free Tier Limits
- **Rate Limit**: 15 requests/minute
- **Token Limit**: 1,500,000 tokens/month (very generous!)
- **Model**: `gemini-pro` (free tier)

### Cost
- **Free**: Up to the monthly limits
- **No credit card required** for free tier
- Paid tier available if you exceed limits

### Quota Management
If you hit quota:
1. System will use fallback basic plan
2. Upgrade to paid tier in Google Cloud Console
3. Or wait for monthly reset

---

## 🛠️ Troubleshooting

### Error: "GEMINI_API_KEY is undefined"
- ✅ Add `GEMINI_API_KEY=...` to `/server/.env`
- ✅ Restart server: `npm start`

### Error: "401 Unauthorized"
- ✅ Check API key is correct (copy from Google AI Studio)
- ✅ Make sure it's in `.env` not hardcoded
- ✅ Verify API is enabled in Google Cloud Console

### Error: "Rate limit exceeded"
- ✅ Wait a minute (15 req/min limit)
- ✅ Or upgrade to paid tier
- ✅ System fallback will kick in

### Gemini returns empty/null
- ✅ Check server logs for parse errors
- ✅ Verify network connection
- ✅ System will fallback to basic plan

---

## 📚 References

- **Google Generative AI SDK**: https://www.npmjs.com/package/@google/generative-ai
- **Gemini API Docs**: https://ai.google.dev/docs
- **Getting an API Key**: https://ai.google.dev/tutorials/setup
- **Pricing**: https://ai.google.dev/pricing

---

## ✅ Done!

Your diet planner now uses AI to create personalized, intelligent meal plans. Users get customized recommendations based on their health profile! 🎉

**Next Steps:**
1. Add your Gemini API key to `.env`
2. Start the server: `npm start`
3. Test the meal plan generation
4. Enjoy AI-powered diet planning! 🚀

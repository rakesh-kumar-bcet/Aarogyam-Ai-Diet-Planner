// server/routes/chat.js
const express = require('express');
const router = express.Router();
let OpenAI = null;
let openai = null;
const hasOpenAIKey = typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.trim() !== '';
if (hasOpenAIKey) {
  try {
    OpenAI = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    console.warn('OpenAI client initialization failed:', e.message || e);
    openai = null;
  }
}

// System prompt — instructs the assistant to be a diet assistant and safe
const SYSTEM_PROMPT = `
You are a helpful, cautious diet and nutrition assistant for a student project. 
Always provide evidence-based, general dietary guidance, mention when a situation requires a medical professional, and include short, actionable suggestions.
If the user mentions medical conditions (diabetes, hypertension, kidney disease, pregnancy, allergies etc.), incorporate them into your reply and give appropriate warnings. 
Never give prescription medical treatment. Always remind user to consult a healthcare provider for personalized medical advice.
Keep answers concise (<= 200 words) unless user asks for more details.
`;

router.post('/', async (req, res) => {
  try {
    const { message, user } = req.body || {}; 
    // user is optional object: { age, weight, height, goal, conditions: [], otherCondition: '' }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Build user context string (if provided)
    let userContext = '';
    if (user) {
      const parts = [];
      if (user.age) parts.push(`age: ${user.age}`);
      if (user.weight) parts.push(`weight: ${user.weight}kg`);
      if (user.height) parts.push(`height: ${user.height}cm`);
      if (user.goal) parts.push(`goal: ${user.goal}`);
      if (Array.isArray(user.conditions) && user.conditions.length) parts.push(`conditions: ${user.conditions.join(', ')}`);
      if (user.otherCondition) parts.push(`other: ${user.otherCondition}`);
      if (parts.length) userContext = `User details — ${parts.join(' | ')}.`;
    }

    // Compose messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (userContext) {
      messages.push({ role: 'system', content: `Context: ${userContext}` });
    }

    messages.push({ role: 'user', content: message });

    // Call OpenAI Chat Completions (if key is configured and client initialized)
    let reply;
    if (!hasOpenAIKey || !openai) {
      // Simple rule-based fallback for demo
      const msg = message.toLowerCase();
      if (msg.includes('weight loss') || msg.includes('lose weight')) {
        reply = "For weight loss, focus on a calorie deficit, eat more vegetables, lean proteins, and whole grains. Exercise regularly with cardio and strength training. Consult a doctor before starting.";
      } else if (msg.includes('gain weight') || msg.includes('muscle')) {
        reply = "To gain weight, consume more calories than you burn, eat nutrient-dense foods like nuts, avocados, and proteins. Include strength training in your routine.";
      } else if (msg.includes('healthy diet')) {
        reply = "A healthy diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Stay hydrated and limit processed foods.";
      } else if (msg.includes('exercise') || msg.includes('workout')) {
        reply = "Regular exercise is key. Aim for 150 minutes of moderate cardio per week, plus strength training 2-3 times. Find activities you enjoy!";
      } else {
        reply = "I'm here to help with diet and fitness questions. Ask about weight loss, healthy eating, or exercise tips!";
      }
    } else {
      // use OpenAI client when available
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 400,
        temperature: 0.2
      });
      reply = completion?.choices?.[0]?.message?.content?.trim() || "Sorry — I couldn't get a reply right now.";
    }

    // Return reply
    return res.json({ reply });

  } catch (err) {
    console.error('Chat error:', err?.response?.data || err);
    // On error, return a safe fallback message
    return res.status(500).json({
      error: 'AI service error',
      reply: 'Sorry — AI is currently unavailable. For personal contact with a nutritionist, check the dashboard for contact information.'
    });
  }
});

module.exports = router;

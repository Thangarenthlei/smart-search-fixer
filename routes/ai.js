import express from "express";
import OpenAI from "openai";

const router = express.Router();

/**
 * OpenAI client
 * Make sure ENV variable exists:
 * OPENAI_API_KEY=sk-xxxx
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/analyze-search
 * Body:
 * {
 *   "query": "blu jeans men",
 *   "products": ["Blue Jeans for Men", "Black Jeans"]
 * }
 */
router.post("/analyze-search", async (req, res) => {
  try {
    const { query, products = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    // ✅ PROMPT (short + structured)
    const prompt = `
You are a friendly, patient Shopify search expert.

Respond ONLY in valid JSON using this exact format:
{
  "summary": "One short sentence (max 20 words)",
  "main_issues": ["Issue 1", "Issue 2"],
  "recommended_fixes": ["Fix 1", "Fix 2"],
  "confidence": "Low | Medium | High"
}

Rules:
- Be concise
- Be encouraging
- No extra text outside JSON

Search query: "${query}"
Available products: ${products.join(", ")}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You explain things clearly like a good teacher.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content;

    // ✅ Ensure valid JSON response
    const parsed = JSON.parse(raw);

    return res.json(parsed);
  } catch (error) {
    console.error("AI ERROR:", error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;

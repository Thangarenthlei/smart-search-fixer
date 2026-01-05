import express from "express";
import OpenAI from "openai";

const router = express.Router();

// Initialize OpenAI (v4 SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/analyze-search
 *
 * Body:
 * {
 *   "query": "blu jeans men",
 *   "products": ["Blue Jeans for Men", "Denim Pants", "Black Jeans"]
 * }
 */
router.post("/analyze-search", async (req, res) => {
  try {
    const { query, products } = req.body;

    if (!query || !Array.isArray(products)) {
      return res.status(400).json({
        error: "Missing or invalid query/products",
      });
    }

    const prompt = `
A customer searched for: "${query}"

Available products:
${products.map((p) => `- ${p}`).join("\n")}

Explain clearly and kindly:
1. Why this search may return zero or poor results
2. What is wrong with the search terms
3. How the store owner can fix it (synonyms, naming, tags)

Be friendly, simple, and explain like a good teacher helping a non-technical store owner.
`;

    // ✅ CORRECT OpenAI v4 call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly teacher who explains e-commerce search problems clearly and calmly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const explanation = completion.choices[0].message.content;

    return res.json({
      success: true,
      explanation,
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    return res.status(500).json({
      error: "AI analysis failed",
    });
  }
});

export default router;

import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/analyze-search
 * Body:
 * {
 *   "query": "blu jeens men",
 *   "products": ["Blue Jeans for Men", "Denim Pants", "Slim Fit Jeans"]
 * }
 */
router.post("/analyze-search", async (req, res) => {
  try {
    const { query, products } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const prompt = `
A customer searched for: "${query}"

Products currently in the store:
${products && products.length ? products.join(", ") : "No products found"}

Explain clearly why this search might return zero or poor results.
Then suggest simple fixes.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a friendly and patient teacher helping Shopify store owners.
Explain things simply, as if teaching a beginner.
Use clear language, short sentences, and examples.
Avoid technical jargon.
Be encouraging and helpful.
Focus on business impact, not code.
`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      explanation: aiResponse,
    });

  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;

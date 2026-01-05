import express from "express";
import OpenAI from "openai";

const router = express.Router();

/**
 * IMPORTANT
 * Env key name MUST be:
 * OPENAI_API_KEY=sk-xxxx
 */
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/analyze-search
 *
 * Body:
 * {
 *   "query": "blu jeans men",
 *   "products": ["Blue Jeans for Men", "Denim Pants"]
 * }
 */
router.post("/analyze-search", async (req, res) => {
  try {
    const { query, products = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const prompt = `
You are a friendly, patient teacher helping a Shopify store owner.

Search query:
"${query}"

Available products:
${products.join(", ")}

Explain:
1. Why this search may fail or succeed
2. What keywords are missing or mismatched
3. How the merchant can rename products or add synonyms
4. Keep it simple and encouraging
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
      temperature: 0.4,
    });

    const explanation =
      completion.choices?.[0]?.message?.content || "No explanation generated";

    res.json({
      success: true,
      explanation,
    });
  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;

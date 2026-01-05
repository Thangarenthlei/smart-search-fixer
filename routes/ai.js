import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/analyze-search", async (req, res) => {
  try {
    const { query, products = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const prompt = `
You are a friendly Shopify search expert.

Search query: "${query}"
Products: ${products.join(", ") || "No products"}

In 2–3 short sentences, explain:
- Why this search may fail
- One simple improvement the merchant can make

Be clear, friendly, and concise.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 120,
    });

    const explanation =
      response.output_text?.trim() ||
      "Search analysis completed, but no explanation was generated.";

    res.json({ explanation });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;

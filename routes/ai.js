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
You are a Shopify search expert.

Search query:
"${query}"

Available products:
${products.length ? products.join(", ") : "No products"}

In 2–3 short sentences:
- Explain why this search might fail or succeed
- Suggest how to improve it (keywords, synonyms, naming)

Keep it simple and helpful.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.3,
      max_output_tokens: 150,
    });

    const explanation =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "No explanation generated.";

    return res.json({ explanation });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;

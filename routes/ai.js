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

Search query: "${query}"
Products: ${products.join(", ")}

Respond in JSON ONLY with:
{
  "summary": "1–2 short sentences",
  "fix": "1 clear actionable suggestion"
}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 120,
    });

    const text =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text;

    if (!text) {
      throw new Error("Empty OpenAI response");
    }

    return res.json(JSON.parse(text));
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;

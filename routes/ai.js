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
You are a friendly, concise Shopify search expert.

Search query:
"${query}"

Available products:
${products.join(", ") || "No products found"}

Respond ONLY in JSON with this structure:
{
  "summary": "Short 2–3 sentence explanation",
  "missing_keywords": ["keyword1", "keyword2"],
  "suggested_actions": ["action1", "action2"]
}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.3,
    });

    const outputText =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text;

    if (!outputText) {
      throw new Error("Empty AI response");
    }

    return res.json(JSON.parse(outputText));
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;

import express from "express";
import SearchQuery from "../models/SearchQuery.js";

const router = express.Router();

router.get("/proxy/search", async (req, res) => {
  try {
    const store = req.query.shop;
    const q = req.query.q;

    if (!store || !q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const query = q.trim().toLowerCase();

    // TEMP: assume zero results for now
    const resultCount = 0;

    await SearchQuery.updateOne(
      { store_id: store, query },
      {
        $inc: {
          total_searches: 1,
          ...(resultCount === 0 ? { zero_result_count: 1 } : {})
        },
        $set: { last_searched_at: new Date() }
      },
      { upsert: true }
    );

    res.json({ results: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Search proxy error");
  }
});

export default router;

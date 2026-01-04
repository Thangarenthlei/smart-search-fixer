import express from "express";
import SearchQuery from "../models/SearchQuery.js";
import ZeroSearch from "../models/ZeroSearch.js";

const router = express.Router();

/**
 * Track every search
 * POST /api/track-search
 */
router.post("/track-search", async (req, res) => {
  try {
    const { shop, query, resultsCount } = req.body;

    if (!shop || !query || resultsCount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save raw search event
    await SearchQuery.create({
      shop,
      query,
      resultsCount,
    });

    // If zero result → aggregate
    if (resultsCount === 0) {
      const existing = await ZeroSearch.findOne({ shop, query });

      if (existing) {
        existing.count += 1;
        existing.lastSeen = new Date();
        await existing.save();
      } else {
        await ZeroSearch.create({
          shop,
          query,
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("track-search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Get zero-search analytics
 * GET /api/analytics/zero-searches?shop=xxx
 */
router.get("/analytics/zero-searches", async (req, res) => {
  try {
    const { shop } = req.query;

    if (!shop) {
      return res.status(400).json({ error: "Shop is required" });
    }

    const zeroSearches = await ZeroSearch.find({ shop })
      .sort({ count: -1 })
      .limit(50);

    const AVG_ORDER_VALUE = 2000;
    const CONVERSION_RATE = 0.1;

    const data = zeroSearches.map(item => ({
      query: item.query,
      count: item.count,
      estimatedLostRevenue:
        item.count * AVG_ORDER_VALUE * CONVERSION_RATE,
    }));

    res.json({ data });
  } catch (err) {
    console.error("zero-search analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

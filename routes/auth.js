import express from "express";

const router = express.Router();

/**
 * Temporary install route (NO OAuth yet)
 * This only proves Shopify can reach our backend
 */
router.get("/install", (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  res.status(200).send(`Install route reached for shop: ${shop}`);
});

export default router;

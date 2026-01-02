import express from "express";
import { shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";
import Shop from "../models/Shop.js";

const router = express.Router();

/**
 * Shopify API setup
 * Uses ENV variables from Render
 */
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/^https?:\/\//, ""),
  apiVersion: "2025-10",
  isEmbeddedApp: true,
});

/**
 * STEP 1: Start OAuth
 * Shopify redirects merchant here
 */
router.get("/start", async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  try {
    const redirectUrl = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ OAuth start failed:", err);
    return res.status(500).send("OAuth start failed");
  }
});

/**
 * STEP 2: OAuth callback
 * Shopify redirects here after approval
 */
router.get("/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { shop, accessToken } = session;

    await Shop.findOneAndUpdate(
      { shop },
      {
        shop,
        accessToken,
        installedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("✅ Shop installed & saved:", shop);

    // App loads inside Shopify admin iframe
    return res.redirect(`/?shop=${shop}`);
  } catch (err) {
    console.error("❌ OAuth callback failed:", err);
    return res.status(500).send("OAuth callback failed");
  }
});

export default router;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";
import searchProxy from "./routes/searchProxy.js";
dotenv.config();
import mongoose from "mongoose";

console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
const app = express();
app.use(cors());
app.use(express.json());
app.use(searchProxy);
/* ================= REQUIRED ENV CHECK ================= */
if (
  !process.env.SHOPIFY_API_KEY ||
  !process.env.SHOPIFY_API_SECRET 
) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

/* ================= SHOPIFY INIT ================= */
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ["read_products"],
  hostName: "example.com",
  apiVersion: "2025-01",
  isEmbeddedApp: false,
});

/* ================= ROOT ROUTE (CRITICAL) ================= */
app.get("/", (req, res) => {
  res.status(200).send("Smart Search Fixer backend is running");
});

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= AUTH START ================= */
app.get("/auth", async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send("Missing shop parameter");

  const authRoute = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
    rawRequest: req,
    rawResponse: res
  });

  return authRoute;
});

/* ================= AUTH CALLBACK ================= */
app.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res
    });

    // App is now installed successfully
    return res.redirect(
      `https://${session.shop}/admin/apps/${process.env.APP_HANDLE}`
    );
  } catch (error) {
    console.error("OAuth error:", error);
    return res.status(500).send("OAuth failed");
  }
});

/* ================= TEST API ================= */
app.get("/api/test", (req, res) => {
  res.json({ message: "API working correctly" });
});
app.get("/", (req, res) => {
  res.send("Backend is live ✅");
});
/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

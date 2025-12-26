import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_APP_URL,
} = process.env;
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Smart Search Fixer</title>
        <meta charset="UTF-8" />
      </head>
      <body style="font-family: Arial; padding: 24px;">
        <h1>Smart Search Fixer ✅</h1>
        <p>Root route is working.</p>
        <p>OAuth is already set up.</p>
      </body>
    </html>
  `);
});

/**
 * STEP 1: Start OAuth
 */
app.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = encodeURIComponent(
  `${SHOPIFY_APP_URL}/auth/callback`
);

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_API_KEY}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`;

  res.redirect(installUrl);
});

/**
 * STEP 2: OAuth Callback
 */
app.get("/auth/callback", async (req, res) => {
  const { shop, hmac, code } = req.query;

  if (!shop || !hmac || !code) {
    return res.status(400).send("Required parameters missing");
  }

  const map = { ...req.query };
  delete map.hmac;

  const message = Object.keys(map)
    .sort()
    .map((key) => `${key}=${map[key]}`)
    .join("&");

  const generatedHash = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(message)
    .digest("hex");

  if (generatedHash !== hmac) {
    return res.status(400).send("HMAC validation failed");
  }

  const tokenResponse = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return res.status(500).send("Failed to get access token");
  }

  // ✅ OAuth success
  res.send("✅ Smart Search Fixer installed successfully");
});
app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    message: "API route is working"
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

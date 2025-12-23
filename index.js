const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Smart Search Fixer backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

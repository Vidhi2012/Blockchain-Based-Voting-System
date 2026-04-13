require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "voting-backend" });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log("Server listening on http://localhost:" + PORT);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

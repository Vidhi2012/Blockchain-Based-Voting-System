/**
 * Run from project root: node database/scripts/seed.js
 * Requires backend/.env with MONGODB_URI and dependencies installed in backend/
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../backend/.env") });

const mongoose = require("mongoose");
const fs = require("fs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voting_app";
const voterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    walletAddress: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);
const Voter = mongoose.models.Voter || mongoose.model("Voter", voterSchema);

async function main() {
  const raw = fs.readFileSync(path.join(__dirname, "../seed-data/voters.json"), "utf8");
  const rows = JSON.parse(raw);
  await mongoose.connect(MONGODB_URI);
  for (const row of rows) {
    await Voter.updateOne({ email: row.email }, { $setOnInsert: row }, { upsert: true });
  }
  console.log("Seed complete:", rows.length, "rows");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

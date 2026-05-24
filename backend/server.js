const express = require("express");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);

// MongoDB Connection
const run = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/myapp");
    console.log("DB connected");
  } catch (err) {
    console.log("DB connection error:", err);
  }
};

run();

// Server Start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
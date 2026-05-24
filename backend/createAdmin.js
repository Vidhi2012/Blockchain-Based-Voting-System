const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb://127.0.0.1:27017/myapp");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model("User", userSchema);

const run = async () => {
  const hashed = await bcrypt.hash("admin123", 10);

  await User.create({
    username: "admin",
    email: "admin@gmail.com",
    password: hashed,
    role: "admin"
  });

  console.log("✅ Admin inserted");
  process.exit();
};

run();
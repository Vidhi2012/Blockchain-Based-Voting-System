const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("Register API hit");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      prn: req.body.prn,
      username: req.body.username,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

  } catch (err) {
    res.status(500).json(err);
  }
});


// LOGIN
router.post("/login", async (req, res) => {
    try {
      console.log("Login API hit");
      console.log("BODY:", req.body);
  
      const user = await User.findOne({ prn: req.body.prn });
  
      if (!user) {
        return res.status(404).json("User not found");
      }
  
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
  
      if (!validPassword) {
        return res.status(400).json("Wrong password");
      }
  
      const accessToken = jwt.sign(
        { id: user._id },
        "secretkey",
        { expiresIn: "1d" }
      );
  
      const { password, ...others } = user._doc;
  
      res.status(200).json({ ...others, accessToken });
  
    } catch (err) {
      console.log("LOGIN ERROR 🔥:", err);
      res.status(500).json({ message: err.message });
    }
  });
module.exports = router;
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    prn: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{14}$/, "PRN must be exactly 14 digits"]
      },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
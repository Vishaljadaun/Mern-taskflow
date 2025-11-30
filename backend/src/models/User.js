const mongoose = require("mongoose");

// ------------------------------
// User Schema (like Entity in .NET)
// ------------------------------
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

module.exports = mongoose.model("User", userSchema);

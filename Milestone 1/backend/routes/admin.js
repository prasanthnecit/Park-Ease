const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

router.get("/dashboard", auth, admin, (req, res) => {
  res.json({ message: "Welcome Admin! You have full access." });
});

// See all users (Admin only)
const User = require("../models/user");
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
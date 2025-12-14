const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret123"; // use env in production

// Helper: normalize email
function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, vehicleNumber, vehicleType, phone, role } =
      req.body;
 
    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
 
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const user = new User({
      name,
      email,
      password: hashedPassword,
      vehicleNumber,
      vehicleType,
      phone,
      role,
    });
 
    await user.save();
 
    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("Login body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("Login failed: user not found for", normalizedEmail);
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Found user (id):", user._id.toString());
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Login failed: incorrect password for", normalizedEmail);
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
});

const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your dashboard!", user: req.user });
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// // GET /api/user/vehicle → Return vehicle details
// router.get("/vehicle", authMiddleware, async (req, res) => {
//   try {
//     // If authMiddleware sets req.user with id or full user object:
//     // prefer fresh data (without password)
//     const user = await User.findById(req.user.id || req.user._id).select(
//       "vehicleNumber vehicleType"
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({
//       vehicleNumber: user.vehicleNumber || "Not provided",
//       vehicleType: user.vehicleType || "Not provided",
//     });
//   } catch (error) {
//     console.error("Vehicle route error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

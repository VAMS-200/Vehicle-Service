const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

// -------------------------
// OTP Store (in-memory)
// -------------------------
const otpStore = {}; // { mobile: { otp, expires, verified } }

// -------------------------
// Ensure uploads directory exists
// -------------------------
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Uploads folder created:", uploadDir);
}

// -------------------------
// Multer setup for file uploads
// -------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // absolute safe path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// -------------------------
// SEND OTP (Admin only)
// -------------------------
router.post("/send-otp", (req, res) => {
  const { mobile, role } = req.body;
  if (!mobile || role !== "admin")
    return res.status(400).json({ msg: "Only admin requires OTP" });

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 mins
  otpStore[mobile] = { otp: generatedOtp, expires, verified: false };

  console.log(`📱 Admin OTP for ${mobile}: ${generatedOtp}`);

  res.json({ success: true, msg: "OTP generated successfully" });
});

// -------------------------
// VERIFY OTP (Admin only)
// -------------------------
router.post("/verify-otp", (req, res) => {
  const { mobile, otp, role } = req.body;
  if (!mobile || !otp || role !== "admin")
    return res.status(400).json({ msg: "Only admin requires OTP" });

  const record = otpStore[mobile];
  if (!record) return res.status(400).json({ msg: "OTP not found. Request again" });
  if (Date.now() > record.expires)
    return res.status(400).json({ msg: "OTP expired" });
  if (record.otp !== otp)
    return res.status(400).json({ msg: "Invalid OTP" });

  record.verified = true;
  res.json({ success: true, msg: "OTP verified successfully" });
});

// -------------------------
// REGISTER
// -------------------------
router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, mobile, username, password, role } = req.body;

      if (!name || !mobile || !username || !password || !role)
        return res.status(400).json({ msg: "All fields are required" });

      // Admin: must have verified OTP
      if (role === "admin") {
        const otpRecord = otpStore[mobile];
        if (!otpRecord || !otpRecord.verified) {
          return res.status(400).json({ msg: "Admin OTP not verified yet" });
        }
      }

      // Prevent multiple admins
      if (role === "admin") {
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
          return res.status(400).json({ msg: "Admin already exists. Use login." });
        }
      }

      // Check existing username + role
      const existingUser = await User.findOne({ username, role });
      if (existingUser) {
        return res.status(400).json({ msg: "User already exists with this role" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Handle file uploads
      const files = req.files || {};
      const photo = files.photo ? "uploads/" + path.basename(files.photo[0].path) : "";
      const aadhaar = files.aadhaar ? "uploads/" + path.basename(files.aadhaar[0].path) : "";
      const drivingLicense = files.drivingLicense
        ? "uploads/" + path.basename(files.drivingLicense[0].path)
        : "";

      const newUserData = {
        name,
        mobile,
        username,
        password: hashedPassword,
        role,
      };

      if (role === "serviceMan") {
        newUserData.photo = photo;
        newUserData.aadhaar = aadhaar;
        newUserData.drivingLicense = drivingLicense;
        newUserData.kycVerified = false;
        newUserData.isActive = false;
        newUserData.rejected = false;
      }

      const newUser = new User(newUserData);
      await newUser.save();

      if (role === "admin" && otpStore[mobile]) delete otpStore[mobile];

      res.status(201).json({
        success: true,
        msg: "User registered successfully",
        user: newUser,
      });
    } catch (err) {
      console.error("❌ Register error:", err);
      res.status(500).json({ msg: "Server error: " + err.message });
    }
  }
);

// -------------------------
// LOGIN
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ msg: "Username, password, and role are required" });
    }

    const normalizedRole = role.trim();
    const users = await User.find({ username: username.trim() });

    if (!users || users.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    const user = users.find((u) => u.role === normalizedRole);
    if (!user) {
      return res.status(400).json({ msg: "User not registered with this role" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    // 🔒 Extra login restrictions for serviceMan
    if (normalizedRole === "serviceMan") {
      if (user.rejected) {
        return res.status(403).json({ msg: "Your application was rejected by the admin" });
      }
      if (!user.kycVerified) {
        return res.status(403).json({ msg: "Your application is under verification" });
      }
      if (!user.isActive) {
        return res.status(403).json({ msg: "Your account has been blocked by admin" });
      }
    }

    res.status(200).json({
      success: true,
      msg: "Login successful",
      user,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

module.exports = router;

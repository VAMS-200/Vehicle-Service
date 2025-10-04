const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, mobile, username, password, role } = req.body;

    if (!name || !mobile || !username || !password || !role)
      return res.status(400).json({ msg: "All fields are required" });

    const existingUser = await User.findOne({ username, role });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists with this role" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      mobile,
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ success: true, msg: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ msg: "Username and password required" });

    const users = await User.find({ username });
    if (!users.length) return res.status(400).json({ msg: "User not found" });

    const user = role ? users.find(u => u.role === role) : users[0];
    if (!user) return res.status(400).json({ msg: "User not registered with this role" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    res.status(200).json({ success: true, msg: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

module.exports = router;
// -------------------------
// UPDATE CUSTOMER LOCATION AFTER LOGIN
// -------------------------
router.put("/update-location/:id", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ msg: "Latitude and longitude required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { latitude, longitude },
      { new: true }
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "Location updated successfully", user });
  } catch (err) {
    console.error("Update location error:", err);
    res.status(500).json({ msg: "Failed to update location" });
  }
});

// Save Service Man location after login
router.post("/save-location", async (req, res) => {
  try {
    const { serviceManId, serviceManLat, serviceManLng } = req.body;

    if (!serviceManId || !serviceManLat || !serviceManLng) {
      return res.status(400).json({ success: false, msg: "Missing location data" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      serviceManId,
      {
        $set: {
          serviceManLat,
          serviceManLng,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, msg: "Service man not found" });
    }

    res.json({ success: true, msg: "Location updated", user: updatedUser });
  } catch (err) {
    console.error("Error saving service man location:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

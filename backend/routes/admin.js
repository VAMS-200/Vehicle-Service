const express = require("express");
const router = express.Router();
const User = require("../models/User");

// -------------------------
// Get all ServiceMen (pending, verified, rejected)
// -------------------------
router.get("/getServicemen", async (req, res) => {
  try {
    const users = await User.find({ role: "serviceMan" }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching servicemen:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// -------------------------
// Approve or Reject KYC + Update Active Status
// -------------------------
router.put("/verifyKyc/:id", async (req, res) => {
  try {
    const { status } = req.body; // true = approve, false = reject

    if (typeof status !== "boolean") {
      return res.status(400).json({ success: false, msg: "Status must be true or false" });
    }

    // ✅ Update user fields
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      status
        ? { kycVerified: true, rejected: false, isActive: true }
        : { kycVerified: false, rejected: true, isActive: false },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({
      success: true,
      msg: `KYC ${status ? "approved and user activated" : "rejected and user deactivated"}`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("KYC verification error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// -------------------------
// Toggle user active status (Block / Unblock)
// -------------------------
router.put("/toggleActive/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // ✅ Toggle active state
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      msg: `User ${user.isActive ? "unblocked" : "blocked"} successfully`,
      user,
    });
  } catch (err) {
    console.error("Error toggling user status:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;

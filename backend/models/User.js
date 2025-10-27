const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "serviceMan", "admin"],
    required: true,
  },
  latitude: { type: Number },
  longitude: { type: Number },

  // ✅ KYC fields
  kycVerified: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false }, // 👈 new field
  isActive: { type: Boolean, default: true },  // 👈 new field (admin block/unblock)

  photo: { type: String },
  aadhaar: { type: String },
  drivingLicense: { type: String },
});

UserSchema.index({ username: 1, role: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);

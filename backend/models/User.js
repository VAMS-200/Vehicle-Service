const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "serviceMan"],
    required: true
  },
  latitude: { type: Number },
  longitude: { type: Number },

});

// ✅ Compound unique index: same username allowed for different roles
UserSchema.index({ username: 1, role: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
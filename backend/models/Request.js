// backend/models/Request.js
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceMan: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    vehicleType: String,
    description: String,
    latitude: Number,
    longitude: Number,
    serviceManLat: Number,
    serviceManLng: Number,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "closed"], // ✅ added "closed"
      default: "pending",
    },
    rating: { type: Number, default: null },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);

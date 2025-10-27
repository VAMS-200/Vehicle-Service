const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// -------------------------
// Middleware
// -------------------------
app.use(express.json());
app.use(cors());

// Serve uploaded files statically (important for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// MongoDB Connection
// -------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://xyz:123@vehicle.mjfjfb5.mongodb.net/?retryWrites=true&w=majority&appName=vehicle";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// -------------------------
// Routes
// -------------------------
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const requestRoutes = require("./routes/request");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/request", requestRoutes);

// -------------------------
// Default route (for testing)
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 Capstone Backend is running successfully!");
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 5001;

app.use(cors()); // allow frontend requests
app.use(express.json());

mongoose.connect("mongodb+srv://xyz:123@vehicle.mjfjfb5.mongodb.net/?retryWrites=true&w=majority&appName=vehicle", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/request", require("./routes/request"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

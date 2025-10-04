const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://xyz:123@vehicle.mjfjfb5.mongodb.net/vehicledb?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
  console.log("MongoDB connected successfully!");
  process.exit(0);
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

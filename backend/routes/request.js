const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

// ✅ Helper to round numbers to fixed decimals
const roundTo = (num, decimals = 6) => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// -------------------------
// CREATE new request (Customer)
// -------------------------
router.post("/create", async (req, res) => {
  try {
    const { customer, vehicleType, description, latitude, longitude } = req.body;

    if (
      !customer ||
      !vehicleType ||
      !description ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res
        .status(400)
        .json({ msg: "All fields including location are required" });
    }

    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ msg: "Invalid location coordinates" });
    }

    const newRequest = new Request({
      customer,
      vehicleType,
      description,
      latitude: latNum,
      longitude: lngNum,
      status: "pending",
    });

    await newRequest.save();
    await newRequest.populate("customer", "name mobile");

    res.status(201).json({
      msg: "Request submitted successfully",
      request: {
        ...newRequest.toObject(),
        latitude: latNum,
        longitude: lngNum,
      },
    });
  } catch (err) {
    console.error("Create request error:", err.message);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// -------------------------
// ACCEPT request (Service Man)
// -------------------------
// -------------------------
// ACCEPT request (Service Man)
// -------------------------
router.put("/accept/:requestId", async (req, res) => {
  try {
    const { serviceManId, serviceManLat, serviceManLng } = req.body;

    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.status !== "pending") {
      return res.status(400).json({ msg: "Request is not pending" });
    }

    request.status = "accepted";
    request.serviceMan = serviceManId;
    request.serviceManLat = roundTo(serviceManLat, 6);
    request.serviceManLng = roundTo(serviceManLng, 6);

    await request.save();

    // ✅ Populate full serviceman info (with photo)
    await request.populate([
      { path: "customer", select: "name mobile latitude longitude" },
      { path: "serviceMan", select: "name mobile photo" },
    ]);

    res.status(200).json({
      msg: "Request accepted successfully",
      request,
    });
  } catch (err) {
    console.error("Error in /accept:", err.message);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});


// -------------------------
// UPDATE Service Man location
// -------------------------
router.put("/update-location/:id", async (req, res) => {
  try {
    const { serviceManLat, serviceManLng } = req.body;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        serviceManLat: roundTo(serviceManLat, 6),
        serviceManLng: roundTo(serviceManLng, 6),
      },
      { new: true }
    );

    if (!request) return res.status(404).json({ error: "Request not found" });

    res.json(request);
  } catch (err) {
    console.error("Error updating location:", err.message);
    res.status(500).json({ error: "Failed to update service man location" });
  }
});

// -------------------------
// GET pending requests
// -------------------------
router.get("/pending", async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" })
      .populate("customer", "name mobile latitude longitude");

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching pending requests:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

// -------------------------
// GET all requests by customer ID (✅ include serviceman photo)
// -------------------------
router.get("/customer/:customerId", async (req, res) => {
  try {
    const requests = await Request.find({ customer: req.params.customerId })
      .populate("serviceMan", "name mobile photo") // ✅ include serviceman photo
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching customer requests:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

// -------------------------
// GET active request by service man
// -------------------------
router.get("/active/:serviceManId", async (req, res) => {
  try {
    const request = await Request.findOne({
      serviceMan: req.params.serviceManId,
      status: { $in: ["accepted", "completed"] },
    })
      .populate("customer", "name mobile latitude longitude")
      .populate("serviceMan", "name mobile photo serviceManLat serviceManLng");

    if (!request) return res.status(404).json({ msg: "No active request found" });

    res.status(200).json(request);
  } catch (err) {
    console.error("Error fetching active request:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

// -------------------------
// GET single request by ID (for live tracking)
// -------------------------
router.get("/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("customer", "name mobile latitude longitude")
      .populate("serviceMan", "name mobile photo serviceManLat serviceManLng");

    if (!request) return res.status(404).json({ msg: "Request not found" });

    res.status(200).json(request);
  } catch (err) {
    console.error("Error fetching request by ID:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

// -------------------------
// COMPLETE request (Customer gives feedback)
// -------------------------
router.put("/complete/:id", async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "completed";
    request.rating = rating;
    request.feedback = feedback;
    await request.save();

    res.status(200).json({
      message: "Request marked as completed and feedback saved",
      request,
    });
  } catch (error) {
    console.error("Error completing request:", error);
    res.status(500).json({ message: "Failed to complete request" });
  }
});

// -------------------------
// CONFIRM completion (Service Man closes task)
// -------------------------
router.put("/confirm-completion/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (request.status !== "completed") {
      return res
        .status(400)
        .json({ msg: "Request is not yet marked as completed by customer" });
    }

    request.status = "closed";
    await request.save();

    res.status(200).json({ msg: "Service man confirmed service completion" });
  } catch (err) {
    console.error("Error confirming completion:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

// -------------------------
// GET all completed requests (Customer)
// -------------------------
router.get("/completed/:customerId", async (req, res) => {
  try {
    const completedRequests = await Request.find({
      customer: req.params.customerId,
      status: { $in: ["completed", "closed"] },
    })
      .populate("serviceMan", "name mobile photo") // ✅ include photo
      .sort({ updatedAt: -1 });

    res.status(200).json(completedRequests);
  } catch (err) {
    console.error("Error fetching completed requests:", err);
    res.status(500).json({ message: "Failed to fetch completed requests" });
  }
});

// -------------------------
// GET all completed tasks (Service Man)
// -------------------------
router.get("/completed-tasks/:serviceManId", async (req, res) => {
  try {
    const requests = await Request.find({
      serviceMan: req.params.serviceManId,
      status: { $in: ["completed", "closed"] },
    })
      .populate("customer", "name mobile")
      .sort({ updatedAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching completed tasks:", err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;

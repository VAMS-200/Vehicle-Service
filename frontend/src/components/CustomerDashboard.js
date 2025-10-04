import React, { useState, useEffect } from "react";
import axios from "axios";
import { Power } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


// ✅ Blue Customer Icon
const customerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [40, 41],
  iconAnchor: [12, 41],
  popupAnchor: [15, -34],
  shadowSize: [41, 41],
});

// ✅ Green ServiceMan Icon
const serviceManIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ✅ Calculate distance (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

// ✅ Auto fit map bounds
function FitBounds({ customer, serviceMan }) {
  const map = useMap();
  useEffect(() => {
    if (customer && serviceMan) {
      const bounds = [
        [customer.lat, customer.lng],
        [serviceMan.lat, serviceMan.lng],
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [customer, serviceMan, map]);
  return null;
}

function CustomerDashboard() {
  const [vehicleType, setVehicleType] = useState("");
  const [description, setDescription] = useState("");
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
 const handleLogout = () => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

  // 🔹 Fetch customer's latest request
  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/request/customer/${user._id}`
      );
      if (res.data.length > 0) {
        setRequest(res.data[0]); // latest request
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  };

  useEffect(() => {
    fetchRequest();
    const interval = setInterval(fetchRequest, 2000);
    return () => clearInterval(interval);
  }, []);
  // ✅ Auto reload dashboard when request is closed (refresh UI cleanly)
useEffect(() => {
  if (request && request.status === "closed") {
    const timer = setTimeout(() => {
      setRequest(null);
    }, 2000); // clear request after 2 seconds to show new form
    return () => clearTimeout(timer);
  }
}, [request]);


  // 🔹 Submit new request
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleType || !description) return alert("Please fill all fields");

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await axios.post("http://localhost:5001/request/create", {
            customer: user._id,
            vehicleType,
            description,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });

          alert("Request submitted successfully!");
          setRequest(res.data.request);
          setVehicleType("");
          setDescription("");
        } catch (err) {
          console.error("Error submitting request:", err);
          alert("Failed to submit request.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        alert("Please allow location access to continue");
        setLoading(false);
      }
    );
  };

  // ✅ Handle “Mark as Completed” click
  const handleComplete = async () => {
    setShowFeedback(true);
  };

  // ✅ Handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (!rating) return alert("Please provide a rating before submitting!");

    try {
      await axios.put(`http://localhost:5001/request/complete/${request._id}`, {
        rating,
        feedback,
      });
      alert("Feedback submitted successfully!");
      setShowFeedback(false);
      setRequest(null); // move to completed
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    }
  };

  // 🔹 Calculate distance if both have coordinates
  let distanceKm = null;
  if (
    request &&
    typeof request.latitude === "number" &&
    typeof request.longitude === "number" &&
    typeof request.serviceManLat === "number" &&
    typeof request.serviceManLng === "number"
  ) {
    distanceKm = calculateDistance(
      request.latitude,
      request.longitude,
      request.serviceManLat,
      request.serviceManLng
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">
          
          Customer Dashboard
        </h2>

        {/* Request Form */}
        {!request || request.status === "completed" || request.status === "closed" ? (
 
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Vehicle Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <textarea
              placeholder="Describe your issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={4}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        ) : (
          <div className="text-center border p-4 rounded-md mt-4 space-y-2">
            <h3 className="font-semibold text-lg">Request Status</h3>
            <p>
              Status:{" "}
              <span
                className={`font-bold ${
                  request.status === "accepted"
                    ? "text-green-600"
                    : request.status === "pending"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {request.status}
              </span>
            </p>

            {request.status === "accepted" && request.serviceMan && (
              <>
                <p>
                  <strong>Service Man:</strong> {request.serviceMan.name}
                </p>
                <p>
                  <strong>Mobile:</strong> {request.serviceMan.mobile}
                </p>
                {distanceKm && (
                  <p className="text-blue-600 font-semibold">
                    📏 Distance: {distanceKm} km
                  </p>
                )}

                {/* ✅ Complete Button */}
                <button
                  onClick={handleComplete}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition transform hover:scale-[1.02]"
                >
                  Mark as Completed
                </button>
              </>
            )}
          </div>
        )}
      </div>
{/* 🔴 Fixed Logout Button (top-right corner) */}
<button
  onClick={handleLogout}
  title="Logout"
  className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
>
  <Power size={22} />
</button>




      {/* 🗺️ Map Section */}
      {request &&
        request.status === "accepted" &&
        typeof request.latitude === "number" &&
        typeof request.longitude === "number" && (
          <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-4xl mt-6 relative z-0">
            <h3 className="text-xl font-semibold mb-2 text-center">
              Active Request
            </h3>

            <MapContainer
              style={{ height: "400px", width: "100%" }}
              className="rounded-lg shadow-md"
              center={[request.latitude, request.longitude]}
              zoom={13}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* Customer Marker */}
              <Marker
                position={[request.latitude, request.longitude]}
                icon={customerIcon}
              >
                <Popup>📍 Your Location</Popup>
              </Marker>

              {/* Service Man Marker */}
              {typeof request.serviceManLat === "number" &&
                typeof request.serviceManLng === "number" && (
                  <>
                    <Marker
                      position={[
                        request.serviceManLat,
                        request.serviceManLng,
                      ]}
                      icon={serviceManIcon}
                    >
                      <Popup>
                        👨‍🔧 {request.serviceMan?.name} <br />
                        📞 {request.serviceMan?.mobile}
                      </Popup>
                    </Marker>

                    {/* Red line between both */}
                    <Polyline
                      positions={[
                        [request.latitude, request.longitude],
                        [request.serviceManLat, request.serviceManLng],
                      ]}
                      pathOptions={{ color: "red", weight: 4 }}
                    />

                    <FitBounds
                      customer={{
                        lat: request.latitude,
                        lng: request.longitude,
                      }}
                      serviceMan={{
                        lat: request.serviceManLat,
                        lng: request.serviceManLng,
                      }}
                    />
                  </>
                )}
            </MapContainer>
          </div>
        )}
<div className="flex justify-center mt-6">
  <button
    onClick={() => (window.location.href = "/your-requests")}
    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition transform duration-200"
  >
    View Your Completed Requests
  </button>
</div>
      {/* 🌟 Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-3">
              Service Completed!
            </h3>
            <p className="text-gray-600 mb-4">Rate the Service</p>

            <div className="flex justify-center mb-4 space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  } hover:scale-110`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              rows={3}
            />

            <button
              onClick={handleFeedbackSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Submit Feedback
            </button>

            <button
              onClick={() => setShowFeedback(false)}
              className="block mt-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;

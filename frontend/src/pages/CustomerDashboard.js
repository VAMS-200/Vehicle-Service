import React, { useState, useEffect } from "react";
import axios from "axios";
import { LogOut } from "lucide-react";
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
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
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
  const [showImageModal, setShowImageModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // 🔹 Fetch customer's latest request
  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/request/customer/${user._id}`
      );
      if (res.data.length > 0) setRequest(res.data[0]);
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  };

  useEffect(() => {
    fetchRequest();
    const interval = setInterval(fetchRequest, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (request && request.status === "closed") {
      const timer = setTimeout(() => setRequest(null), 2000);
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
          const res = await axios.post("http://localhost:5001/api/request/create", {
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
      () => {
        alert("Please allow location access to continue");
        setLoading(false);
      }
    );
  };

  const handleComplete = async () => setShowFeedback(true);

  const handleFeedbackSubmit = async () => {
    if (!rating) return alert("Please provide a rating!");
    try {
      await axios.put(`http://localhost:5001/api/request/complete/${request._id}`, {
        rating,
        feedback,
      });
      alert("Feedback submitted successfully!");
      setShowFeedback(false);
      setRequest(null);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    }
  };

  let distanceKm = null;
  if (
    request &&
    request.latitude &&
    request.longitude &&
    request.serviceManLat &&
    request.serviceManLng
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
      {/* Dashboard card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md relative z-[20]">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">
          Customer Dashboard
        </h2>

        {/* Request Form or Active Request */}
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
          <div className="text-center border p-4 rounded-md mt-4 space-y-3 relative z-[30]">
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

            {/* ✅ Show Serviceman Info */}
            {request.status === "accepted" && request.serviceMan && (
              <div className="mt-6 bg-white rounded-2xl border border-transparent bg-gradient-to-r from-blue-50 via-white to-blue-50 p-1 max-w-xl mx-auto shadow-lg transition-all duration-300 relative z-[50]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start bg-white rounded-2xl p-4 gap-6">
                  {/* ✅ Serviceman Photo */}
                  <img
                    src={
                      request.serviceMan.photo
                        ? `http://localhost:5001/${request.serviceMan.photo.replace(/\\/g, "/")}`
                        : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    }
                    alt="Service Man"
                    className="w-full sm:w-56 h-40 object-cover rounded-xl border border-blue-200 cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) =>
                      (e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/847/847969.png")
                    }
                  />

                  {/* ✅ Serviceman Details */}
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      {request.serviceMan.name}
                    </h3>
                    <p className="text-gray-600 font-medium mb-1">
                      📞 {request.serviceMan.mobile}
                    </p>

                    {distanceKm && (
                      <p className="text-blue-600 font-semibold mt-1">
                        📏 Distance: {distanceKm} km
                      </p>
                    )}

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleComplete}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold shadow transition-transform hover:scale-105"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="fixed top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-[100]"
      >
        <LogOut size={20} /> Logout
      </button>

      {/* Map */}
      {request &&
        request.status === "accepted" &&
        request.latitude &&
        request.longitude && (
          <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-4xl mt-6 relative z-[0]">
            <h3 className="text-xl font-semibold mb-2 text-center">
              Active Request
            </h3>
            <MapContainer
              style={{ height: "400px", width: "100%" }}
              center={[request.latitude, request.longitude]}
              zoom={13}
              className="z-[0]"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              <Marker
                position={[request.latitude, request.longitude]}
                icon={customerIcon}
              >
                <Popup>📍 Your Location</Popup>
              </Marker>

              {request.serviceManLat && request.serviceManLng && (
                <>
                  <Marker
                    position={[request.serviceManLat, request.serviceManLng]}
                    icon={serviceManIcon}
                  >
                    <Popup>
                      👨‍🔧 {request.serviceMan?.name} <br />
                      📞 {request.serviceMan?.mobile}
                    </Popup>
                  </Marker>

                  <Polyline
                    positions={[
                      [request.latitude, request.longitude],
                      [request.serviceManLat, request.serviceManLng],
                    ]}
                    pathOptions={{ color: "red", weight: 4 }}
                  />

                  <FitBounds
                    customer={{ lat: request.latitude, lng: request.longitude }}
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

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[2000]">
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

      {/* Full Image Modal */}
      {showImageModal && request.serviceMan?.photo && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[3000]"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative">
            <img
              src={`http://localhost:5001/${request.serviceMan.photo.replace(/\\/g, "/")}`}
              alt="Service Man Full"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-lg border-4 border-white"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-black rounded-full p-2"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;

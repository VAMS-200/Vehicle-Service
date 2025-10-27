import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline,useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { LogOut } from "lucide-react";


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

// ✅ Distance function
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
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

// ✅ Auto-fit map bounds to show both markers
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


const ServiceDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [serviceManLocation, setServiceManLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  // 🔹 Load user from localStorage instead of props
  const user = JSON.parse(localStorage.getItem("user"));
const handleLogout = () => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/request/pending");
      setRequests(res.data);
      
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };
const fetchActiveRequest = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5001/api/request/active/${user._id}`
    );
    setActiveRequest(res.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // No active request, it's fine
      setActiveRequest(null);
    } else {
      console.error("Error fetching active request:", err);
    }
  }
};

  // Accept request
  const handleAccept = async (requestId) => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const res = await axios.put(
          `http://localhost:5001/api/request/accept/${requestId}`,
          {
            serviceManId: user._id,
            serviceManLat: pos.coords.latitude,
            serviceManLng: pos.coords.longitude,
          }
        );

        // ✅ Immediately re-fetch the full request with both locations
        const fullReq = await axios.get(
          `http://localhost:5001/api/request/${requestId}`
        );

        alert("Request accepted!");
        setActiveRequest(fullReq.data);
        setRequests([]); // clear pending list
        startLocationUpdates(fullReq.data._id);
      } catch (err) {
        console.error("Error accepting request:", err);
        alert("Failed to accept request");
      }
    },
    (err) => {
      console.error("GPS error:", err);
      alert("Please enable location access!");
    }
  );
};
const handleConfirmCompletion = async (requestId) => {
  try {
    await axios.put(`http://localhost:5001/api/request/confirm-completion/${requestId}`);
    alert("Service completion confirmed!");

    // 🚀 Immediately clear the active request so dashboard updates instantly
    setActiveRequest(null);

    // ✅ Refresh pending requests (if any new ones appear)
    fetchPendingRequests();
  } catch (err) {
    console.error("Error confirming completion:", err);
    alert("Failed to confirm completion.");
  }
};


  // Update service man location periodically
  const startLocationUpdates = (requestId) => {
    setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await axios.put(
            `http://localhost:5001/api/request/update-location/${requestId}`,
            {
              serviceManLat: pos.coords.latitude,
              serviceManLng: pos.coords.longitude,
            }
          );
        } catch (err) {
          console.error("Error updating service man location:", err);
        }
      });
    }, 1000);
  };

  // Poll active request
  useEffect(() => {
    if (!activeRequest) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/request/${activeRequest._id}`
        );
        setActiveRequest(res.data);

        if (
  Number.isFinite(res.data.latitude) &&
  Number.isFinite(res.data.longitude) &&
  Number.isFinite(res.data.serviceManLat) &&
  Number.isFinite(res.data.serviceManLng)
) {
  setDistance(
    calculateDistance(
      res.data.latitude,
      res.data.longitude,
      res.data.serviceManLat,
      res.data.serviceManLng
    )
  );
}

      } catch (err) {
        console.error("Error refreshing active request:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRequest]);

  // Load pending requests
  useEffect(() => {
  fetchActiveRequest();
  fetchPendingRequests();

  const interval = setInterval(() => {
    fetchPendingRequests();
    fetchActiveRequest();
  }, 2000);

  return () => clearInterval(interval);
}, []);

 
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Service Man Dashboard
      </h2>
{/* 🔴 Fixed Logout Button (top-right corner) */}
<button
  onClick={handleLogout}
  title="Logout"
  className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-red-600 hover:to-red-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-transform transform hover:scale-110"
>
  <LogOut size={20} />
  Logout
</button>

      {!activeRequest ? (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Pending Requests
          </h3>
          {requests.length === 0 ? (
            <p className="text-center text-gray-600">
              No pending requests right now
            </p>
          ) : (
            <ul className="space-y-4">
              {requests.map((req) => (
                <li
                  key={req._id}
                  className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div className="text-sm">
                    <p>
                      <span className="font-semibold">Customer:</span>{" "}
                      {req.customer?.name}
                    </p>
                    <p>
                      <span className="font-semibold">Vehicle:</span>{" "}
                      {req.vehicleType}
                    </p>
                    <p>
                      <span className="font-semibold">Description:</span>{" "}
                      {req.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Accept
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Active Request
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Customer:</span>{" "}
              {activeRequest.customer?.name}
            </p>
            <p>
              <span className="font-semibold">Mobile:</span>{" "}
              {activeRequest.customer?.mobile}
            </p>
            <p>
              <span className="font-semibold">Vehicle:</span>{" "}
              {activeRequest.vehicleType}
            </p>
            <p>
              <span className="font-semibold">Description:</span>{" "}
              {activeRequest.description}
            </p>
            <p className="text-green-600 font-semibold">
              Status: {activeRequest.status}
            </p>
            {activeRequest.status === "completed" ? (
  <div className="text-center mt-6">
    <button
      onClick={() => handleConfirmCompletion(activeRequest._id)}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
    >
      Confirm Service Completion ✅
    </button>
  </div>
) : (
  <p className="text-green-600 text-center mt-4 font-semibold">
    Waiting for customer to mark as completed...
  </p>
)}


            {distance && (
              <p className="text-blue-600 font-semibold">
                Distance: {distance} km
              </p>
            )}
          </div>

          {/* Map */}
          {typeof activeRequest.latitude === "number" &&
          typeof activeRequest.longitude === "number" ? (
            <MapContainer
              
              style={{ height: "400px", width: "100%", marginTop: "1rem" }}
              className="rounded-lg shadow-md"
            >
              <FitBounds
  customer={{
    lat: activeRequest.latitude,
    lng: activeRequest.longitude,
  }}
  serviceMan={{
    lat: activeRequest.serviceManLat,
    lng: activeRequest.serviceManLng,
  }}
/>

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />


              {/* Customer Marker */}
              <Marker
                position={[activeRequest.latitude, activeRequest.longitude]}
                icon={customerIcon}
              >
                <Popup>📍 Customer</Popup>
              </Marker>

              {/* Service Man Marker */}
              {/* Service Man Marker */}
{Number.isFinite(activeRequest.serviceManLat) &&
 Number.isFinite(activeRequest.serviceManLng) && (
   <>
     <Marker
       position={[
         activeRequest.serviceManLat,
         activeRequest.serviceManLng,
       ]}
       icon={serviceManIcon}
     >
       <Popup>👨‍🔧 You</Popup>
     </Marker>

     {/* Red Line */}
     <Polyline
       positions={[
         [activeRequest.latitude, activeRequest.longitude],
         [activeRequest.serviceManLat, activeRequest.serviceManLng],
       ]}
       pathOptions={{ color: "red", weight: 4 }}
     />
   </>
 )}

            </MapContainer>
          ) : (
            <p className="text-center text-red-500 mt-4">
              Customer location not available
            </p>
          )}
        </div>
      )}
      {/* 🌟 Beautiful Completed Tasks Button */}
<div className="flex justify-center mt-10">
  <a
    href="/service-completed-tasks"
    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12l-7.5 7.5M3 12h18"
      />
    </svg>
    View Completed Tasks
  </a>
</div>

    </div>
  );
}

export default ServiceDashboard;
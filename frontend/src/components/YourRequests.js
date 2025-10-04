import React, { useEffect, useState } from "react";
import axios from "axios";

function YourRequests() {
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchCompletedRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/request/completed/${user._id}`
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching completed requests:", err);
    }
  };

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Your Completed Service Requests
        </h1>

        {requests.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">
            No completed requests yet.
          </p>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-5 border border-gray-200 rounded-xl shadow-md bg-gradient-to-r from-white to-blue-50 hover:shadow-lg transition transform hover:-translate-y-1 duration-200"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">
                    🚗 {req.vehicleType}
                  </h3>
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Completed
                  </span>
                </div>

                <p className="text-gray-700 mt-2">
                  <strong>Description:</strong> {req.description}
                </p>
                <p className="text-gray-700 mt-1">
                  <strong>Service Man:</strong> {req.serviceMan?.name || "N/A"} (
                  {req.serviceMan?.mobile || "N/A"})
                </p>

                {req.rating && (
                  <p className="mt-2 text-yellow-600 font-semibold">
                    ⭐ Rating: {req.rating}/5
                  </p>
                )}

                {req.feedback && (
                  <p className="mt-1 italic text-gray-600">
                    💬 “{req.feedback}”
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-3">
                  Completed on:{" "}
                  {new Date(req.updatedAt).toLocaleString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => (window.location.href = "/customer-dashboard")}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default YourRequests;

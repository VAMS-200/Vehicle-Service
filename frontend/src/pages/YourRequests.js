import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftCircle } from "lucide-react";

function YourRequests() {
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchCompletedRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/request/completed/${user._id}`
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center p-6">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-5xl border border-blue-100">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-8 drop-shadow-sm">
          Your Completed Service Requests
        </h1>

        {requests.length === 0 ? (
          <p className="text-gray-600 text-center text-lg italic">
            You haven’t completed any service requests yet.
          </p>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-5 border border-blue-100 rounded-xl shadow-md bg-gradient-to-r from-blue-50 to-white hover:shadow-lg transition transform hover:-translate-y-1 duration-300"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-blue-800">
                     {req.vehicleType}
                  </h3>
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full shadow-sm">
                    Completed
                  </span>
                </div>

                <p className="text-gray-700 mt-2 leading-relaxed">
                  <strong className="text-gray-800">Description:</strong>{" "}
                  {req.description}
                </p>

                <p className="text-gray-700 mt-1">
                  <strong className="text-gray-800">Service Man:</strong>{" "}
                  {req.serviceMan?.name || "N/A"}{" "}
                  
                </p>
                <p className="text-gray-700 mt-1">
                  <strong className="text-gray-800">Mobile:</strong>{" "}
                  {req.serviceMan?.mobile || "N/A"}{" "}
                  
                </p>

                {req.rating && (
                  <p className="mt-2 text-yellow-500 font-semibold">
                    ⭐ Rating: {req.rating}/5
                  </p>
                )}

                {req.feedback && (
                  <p className="mt-1 italic text-gray-600 border-l-4 border-blue-200 pl-3">
                    💬 “{req.feedback}”
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-3">
                  🕒 Completed on:{" "}
                  <span className="font-medium">
                    {new Date(req.updatedAt).toLocaleString("en-GB")}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 🔙 Back to Dashboard */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => (window.location.href = "/customer-dashboard")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition duration-300"
          >
            <ArrowLeftCircle size={22} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default YourRequests;

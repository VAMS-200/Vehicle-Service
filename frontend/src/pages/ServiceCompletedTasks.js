import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";

const ServiceCompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch completed requests of this service man
  const fetchCompletedTasks = async () => {
    try {
      const res = await axios.get(
  `http://localhost:5001/api/request/completed-tasks/${user._id}`
);

      setCompletedTasks(res.data);
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  // ⭐ Helper for displaying rating
  const renderStars = (rating) => {
    const totalStars = 5;
    return (
      <div className="flex gap-1">
        {Array.from({ length: totalStars }, (_, i) => (
          <Star
            key={i}
            size={18}
            className={`${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Your Completed Tasks
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading...</p>
      ) : completedTasks.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          You have not completed any requests yet.
        </p>
      ) : (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {completedTasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition duration-300"
            >
              <h3 className="text-xl font-semibold text-blue-700 mb-2">
                {task.vehicleType}
              </h3>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Customer:</span>{" "}
                {task.customer?.name || "Unknown"}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Mobile:</span>{" "}
                {task.customer?.mobile || "N/A"}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Issue:</span>{" "}
                {task.description}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="font-semibold text-gray-800">Rating:</span>
                {renderStars(task.rating || 0)}
              </div>

              {task.feedback && (
                <p className="mt-3 italic text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                  “{task.feedback}”
                </p>
              )}

              <div className="mt-4 text-sm text-gray-500 text-right">
                🕒Completed on{" "}
                {new Date(task.updatedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-center mt-10">
        <a
          href="/service-man-dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default ServiceCompletedTasks;

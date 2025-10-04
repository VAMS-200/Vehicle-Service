import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "customer",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending login request with:", formData);

      const res = await axios.post("http://localhost:5001/auth/login", formData);
      console.log("Frontend received:", res.data);

      if (res.data.success && res.data.user) {
        alert("Login successful ✅");

        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(user));
          // Ask for location (only for customers)
  if (res.data.user.role.toLowerCase() === "customer") {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.put(`http://localhost:5001/auth/update-location/${res.data.user._id}`, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          console.log("✅ Customer location updated successfully");
        } catch (err) {
          console.error("Failed to update customer location:", err);
        }
      },
      (err) => {
        console.warn("⚠️ Location permission denied:", err);
      }
    );
  }


        const role = user.role.trim().toLowerCase();

        // ✅ If Service Man, capture location immediately
        if (role === "serviceman" || role === "serviceMan") {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              };
              localStorage.setItem("serviceManLocation", JSON.stringify(coords));

              // Optional: save in backend
              axios.post("http://localhost:5001/auth/save-location", {
                serviceManId: user._id,
                serviceManLat: coords.lat,
                serviceManLng: coords.lng,
              });

              console.log("Service man location saved:", coords);
            },
            (err) => {
              console.error("Location access denied:", err);
              alert("⚠️ Please enable location access for live tracking.");
            }
          );
        }

        // ✅ Navigate to dashboards
        if (role === "customer") {
          navigate("/customer-dashboard", { replace: true });
        } else if (role === "serviceman" || role === "serviceman") {
          navigate("/service-dashboard", { replace: true });
        } else {
          alert("Unknown role: " + user.role);
        }
      } else {
        alert(res.data.msg || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Login failed due to server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
          >
            <option value="customer">Customer</option>
            <option value="serviceMan">Service Man</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

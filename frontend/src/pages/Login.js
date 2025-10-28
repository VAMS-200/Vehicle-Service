import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login({ setUser }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("https://vehicle-service-60rr.onrender.com/api/auth/login", formData);
      console.log("Login response:", res.data);

      if (res.data.success && res.data.user) {
        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);

        const role = user.role.toLowerCase();
        if (role === "customer") navigate("/customer-dashboard", { replace: true });
        else if (role === "serviceman") navigate("/service-man-dashboard", { replace: true });
        else if (role === "admin") navigate("/admin-dashboard", { replace: true });
        else alert("Unknown role: " + user.role);
      } else {
        alert(res.data.msg || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Login failed due to server error");
    } finally {
      setLoading(false);
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
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
        <p className="mt-2 text-center text-gray-600">
          Are you an admin?{" "}
          <Link to="/admin-login" className="text-blue-600 hover:underline font-semibold">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css"; // optional, for styling

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
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
      console.log("Sending registration request:", formData);

      const res = await axios.post(
        "http://localhost:5001/auth/register",
        formData
      );

      console.log("Frontend received:", res.data);

      if (res.data.user) {
        alert("Registration successful! Please login.");

        // Navigate to login page after registration
        navigate("/login", { replace: true });
      } else {
        alert(res.data.msg || "Registration failed");
      }
    } catch (err) {
      console.error(
        "Registration error:",
        err.response ? err.response.data : err.message
      );
      alert(err.response?.data?.msg || "Registration failed due to server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="serviceMan">Service Man</option>
          </select>
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/Login" className="text-blue-600 hover:underline">
                      Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

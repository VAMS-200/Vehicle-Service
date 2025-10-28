import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    username: "",
    password: "",
    role: "customer",
  });

  const [photo, setPhoto] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [drivingLicense, setDrivingLicense] = useState(null);

  // Admin OTP
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Reset OTP if role changes
    if (e.target.name === "role" && e.target.value !== "admin") {
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.length) return;
    if (name === "photo") setPhoto(files[0]);
    if (name === "aadhaar") setAadhaar(files[0]);
    if (name === "drivingLicense") setDrivingLicense(files[0]);
  };

  // Send OTP (for admin only)
  const sendOtp = async () => {
    if (!formData.mobile) return alert("Enter mobile number first");
    try {
      const res = await axios.post("https://vehicle-service-60rr.onrender.com/api/auth/send-otp", {
        mobile: formData.mobile,
        role: "admin",
      });
      if (res.data.success) {
        setOtpSent(true);
        alert("OTP sent ✅");
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post("https://vehicle-service-60rr.onrender.com/api/auth/verify-otp", {
        mobile: formData.mobile,
        otp,
        role: "admin",
      });
      if (res.data.success) {
        setOtpVerified(true);
        setOtpSent(false);
        alert("OTP verified ✅");
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "admin" && !otpVerified) {
      return alert("Please verify admin OTP first");
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("mobile", formData.mobile);
      data.append("username", formData.username);
      data.append("password", formData.password);
      data.append("role", formData.role);

      if (formData.role === "serviceMan") {
        if (photo) data.append("photo", photo);
        if (aadhaar) data.append("aadhaar", aadhaar);
        if (drivingLicense) data.append("drivingLicense", drivingLicense);
      }

      const res = await axios.post(
        "https://vehicle-service-60rr.onrender.com/api/auth/register",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login", { replace: true });
      } else {
        alert(res.data.msg || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
          />

          {/* Admin OTP Section */}
          {formData.role === "admin" && !otpVerified && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={sendOtp}
                  className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600"
                >
                  Send OTP
                </button>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

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
            <option value="admin">Admin</option>
          </select>

          {/* ✅ KYC Uploads for Service Man */}
          {formData.role === "serviceMan" && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-gray-700 font-medium">Recent Picture</span>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="mt-1 block w-full"
                />
              </label>

              <label className="block">
                <span className="text-gray-700 font-medium">Aadhaar Card</span>
                <input
                  type="file"
                  name="aadhaar"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                  className="mt-1 block w-full"
                />
              </label>

              <label className="block">
                <span className="text-gray-700 font-medium">Driving Licence</span>
                <input
                  type="file"
                  name="drivingLicense"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                  className="mt-1 block w-full"
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

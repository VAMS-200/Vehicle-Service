import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import ServiceManDashboard from "./pages/ServiceManDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import YourRequests from "./pages/YourRequests";
import ServiceCompletedTasks from "./pages/ServiceCompletedTasks";
function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const getRole = (role) => role?.toLowerCase(); // normalize role

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/admin-login" element={<AdminLogin setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Dashboard */}
        <Route
          path="/customer-dashboard"
          element={
            user && getRole(user.role) === "customer" ? (
              <CustomerDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
<Route path="/your-requests" element={<YourRequests />} />
        {/* Service Man Dashboard */}
        <Route
          path="/service-man-dashboard"
          element={
            user && getRole(user.role) === "serviceman" ? (
              <ServiceManDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
 <Route path="/service-completed-tasks" element={<ServiceCompletedTasks />} /> 
        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            user && getRole(user.role) === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin-login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerDashboard from "./components/CustomerDashboard";
import ServiceDashboard from "./components/ServiceDashboard";
import YourRequests from "./components/YourRequests";
import ServiceCompletedTasks from "./components/ServiceCompletedTasks"; // ✅ new import

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root "/" to "/register" */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer routes */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/your-requests" element={<YourRequests />} />

        {/* Service man routes */}
        <Route path="/service-dashboard" element={<ServiceDashboard />} />
        <Route path="/service-completed-tasks" element={<ServiceCompletedTasks />} /> {/* ✅ added */}
      </Routes>
    </Router>
  );
}

export default App;

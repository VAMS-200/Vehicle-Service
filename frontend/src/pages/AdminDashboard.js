import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Hourglass,
  UserCog,
  LogOut,
  Slash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🧩 Fetch all service men
  const fetchServiceMen = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/admin/getServicemen");
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch servicemen on mount + auto-refresh every 10s
  useEffect(() => {
    fetchServiceMen();
    const interval = setInterval(fetchServiceMen, 10000); // auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // ✅ Approve KYC
  const handleVerify = async (id) => {
    if (!window.confirm("Approve this serviceman’s KYC?")) return;
    try {
      const res = await axios.put(
        `http://localhost:5001/api/admin/verifyKyc/${id}`,
        { status: true }
      );
      if (res.data.success) {
        fetchServiceMen(); // refresh data automatically
      }
    } catch (err) {
      console.error("Error verifying user:", err);
    }
  };

  // ❌ Reject KYC
  const handleReject = async (id) => {
    if (!window.confirm("Reject this serviceman’s KYC?")) return;
    try {
      const res = await axios.put(
        `http://localhost:5001/api/admin/verifyKyc/${id}`,
        { status: false }
      );
      if (res.data.success) {
        fetchServiceMen(); // refresh data automatically
      }
    } catch (err) {
      console.error("Error rejecting user:", err);
    }
  };

  // 🚫 Block / Unblock serviceman
  const handleToggleActive = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/admin/toggleActive/${id}`
      );
      if (res.data.success) {
        fetchServiceMen(); // refresh after toggle
      }
    } catch (err) {
      console.error("Error toggling user active status:", err);
    }
  };

  // 🔒 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCog className="text-blue-400" /> Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-red-600 hover:to-red-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-transform transform hover:scale-110"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="overflow-x-auto w-full bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg">
        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
        ) : (
          <table className="min-w-full text-sm text-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-100">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Mobile</th>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-center">KYC</th>
                <th className="py-3 px-4 text-center">Documents</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.role === "serviceMan")
                .map((user) => (
                  <tr key={user._id} className="border-b border-gray-700">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.mobile}</td>
                    <td className="py-3 px-4">{user.username}</td>

                    {/* 🪪 KYC Status */}
                    <td className="py-3 px-4 text-center">
                      {!user.kycVerified && !user.rejected ? (
                        <span className="text-yellow-400 flex items-center justify-center gap-1">
                          Pending <Hourglass size={16} />
                        </span>
                      ) : user.kycVerified ? (
                        <span className="text-green-400 flex items-center justify-center gap-1">
                          Verified <CheckCircle size={16} />
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center justify-center gap-1">
                          Rejected <XCircle size={16} />
                        </span>
                      )}
                    </td>

                    {/* 📸 KYC Documents Preview */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        {user.photo && (
                          <a
                            href={`http://localhost:5001/${user.photo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={`http://localhost:5001/${user.photo}`}
                              alt="User"
                              className="w-12 h-12 rounded-full border border-gray-600 object-cover cursor-pointer"
                            />
                          </a>
                        )}
                        {user.aadhaar && (
                          <a
                            href={`http://localhost:5001/${user.aadhaar}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={`http://localhost:5001/${user.aadhaar}`}
                              alt="Aadhaar"
                              className="w-12 h-12 rounded border border-gray-600 object-cover cursor-pointer"
                            />
                          </a>
                        )}
                        {user.drivingLicense && (
                          <a
                            href={`http://localhost:5001/${user.drivingLicense}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={`http://localhost:5001/${user.drivingLicense}`}
                              alt="License"
                              className="w-12 h-12 rounded border border-gray-600 object-cover cursor-pointer"
                            />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* ⚙️ Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center flex-wrap">
                        {/* Pending servicemen → Approve / Reject */}
                        {!user.kycVerified && !user.rejected ? (
                          <>
                            <button
                              onClick={() => handleVerify(user._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(user._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        ) : user.kycVerified ? (
                          <>
                            <button
                              onClick={() => handleToggleActive(user._id)}
                              className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                                user.isActive
                                  ? "bg-red-600 hover:bg-red-700" // show red when active (block)
                                  : "bg-green-600 hover:bg-green-700" // show green when inactive (unblock)
                              } text-white`}
                            >
                              <Slash size={14} />{" "}
                              {user.isActive ? "Block" : "Unblock"}
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">
                            No actions
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

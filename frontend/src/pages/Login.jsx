// Login.jsx
// This page allows a registered user to log in.
// Includes:
// - Input validation
// - Toast notifications
// - Show/Hide password toggle
// - Loading animation
// - Redirect to dashboard on success

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.email.includes("@")) return toast.error("Invalid email");
    if (!formData.password.trim()) return toast.error("Password required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", formData);
      login(res.data.token);
      toast.success("Login successful!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input
            name="email"
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="relative">
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              className="w-full border p-2 rounded"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <span
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-2 cursor-pointer select-none text-gray-600"
            >
              {showPwd ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

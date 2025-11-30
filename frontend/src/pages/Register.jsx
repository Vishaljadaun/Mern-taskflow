// Register.jsx
// This page allows a new user to create an account.
// Includes:
// - Input validation
// - Password strength meter
// - Toast notifications
// - Loading animation
// - Redirect after success

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  // Form state fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // UI states
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ------------------------------------------------------
  // PASSWORD STRENGTH CHECKER
  // ------------------------------------------------------
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.length >= 8
    )
      return "Strong";

    return "Medium";
  };

  // ------------------------------------------------------
  // HANDLE INPUT CHANGES
  // ------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // ------------------------------------------------------
  // VALIDATION BEFORE SUBMIT
  // ------------------------------------------------------
  const validateInputs = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      toast.error("Enter a valid email");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // ------------------------------------------------------
  // REGISTER USER (SUBMIT)
  // ------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", formData);

      toast.success("Registration successful! Redirecting...");

      // Redirect after a delay
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // UI (FORM + PASSWORD METER + BUTTON LOADING)
  // ------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Email Input */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Password Input */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Password Strength Meter */}
          {formData.password && (
            <p
              className={`text-sm ${
                passwordStrength === "Weak"
                  ? "text-red-500"
                  : passwordStrength === "Medium"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              Password Strength: {passwordStrength}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>

        {/* Already have account */}
        <p className="mt-3 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

// App.jsx
// This file defines all the routes of the frontend.
// Login, Register are public routes. Dashboard is a protected route.

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// ProtectedRoute.jsx
// Protects any route by checking authentication state.
// Uses AuthContext instead of reading localStorage directly.

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  return children;
}

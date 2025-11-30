// AuthContext.jsx
// This creates a global authentication layer.
// It tracks:
// - user state
// - token
// - login()
// - logout()
// - auto logout when token is expired

import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";   // ✅ correct import
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // Load user on refresh
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Token expired?
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch {
        logout();
      }
    }
  }, [token]);

  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);

    const decoded = jwtDecode(jwtToken);
    setUser(decoded);

    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

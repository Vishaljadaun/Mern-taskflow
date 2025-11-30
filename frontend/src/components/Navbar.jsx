import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          MERN TaskFlow
        </Link>

        <div className="space-x-4">
          {token ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

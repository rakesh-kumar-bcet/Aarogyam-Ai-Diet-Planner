import React from "react";  
import { Navigate } from "react-router-dom";

export default function NutrenistRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  return role === "nutrenist" ? children : <Navigate to="/dashboard" replace />;
}

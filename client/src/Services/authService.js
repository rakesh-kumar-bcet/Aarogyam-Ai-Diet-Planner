// src/Services/authService.js
import axios from "axios";
import API_BASE_URL from "../config/api";

const BASE_URL = `${API_BASE_URL}/api/auth`;

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/register`, data, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data; // Returns { token, userId, name, role }
  } catch (err) {
    console.error("Register API error:", err);
    throw err; // Propagate error to frontend
  }
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/login`, data, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data; // ✅ Return data with token, user info
  } catch (err) {
    console.error("Login API error:", err.response?.data || err.message);
    throw err; // Propagate error to frontend
  }
};

/* =========================
   ADMIN LOGIN
========================= */
export const adminLoginUser = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/admin-login`, data, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  } catch (err) {
    console.error("Admin Login API error:", err.response?.data || err.message);
    throw err;
  }
};

/* =========================
   LOGOUT USER
========================= */
export const logoutUser = async () => {
  try {
    const res = await axios.post(`${BASE_URL}/logout`, {}, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (err) {
    console.error("Logout API error:", err.response?.data || err.message);
    throw err;
  }
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (data) => {
  try {
    const res = await axios.put(`${BASE_URL}/update-profile`, data, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" }
    });
    return res.data;
  } catch (err) {
    console.error("Update profile API error:", err.response?.data || err.message);
    throw err;
  }
};

/* =========================
   COMPLETE NUTRITIONIST PROFILE
========================= */
export const completeNutritionistProfile = async (userId, profileData) => {
  try {
    const res = await axios.post(`${BASE_URL}/complete-nutritionist-profile`, 
      { userId, ...profileData },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Profile completion API error:", err);
    throw err;
  }
};

/* =========================
   HELPER TO GET AUTH HEADER
========================= */
export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

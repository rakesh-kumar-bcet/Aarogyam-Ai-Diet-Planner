// src/Services/dietService.js
import axios from "axios";

const BASE_URL = "/api/diet"; // use proxy in development and relative URL in production

// Helper to get headers with JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  // developer debug: remove or silence in production
  console.log("Using token:", token ? "Present" : "Missing");
  return {
    Authorization: `Bearer ${token}`
  };
};

/* ============================
   Generate a new diet plan
============================ */
export const generatePlan = async (data) => {
  try {
    console.log("Generating plan with data:", data);  // Debug: Log input data (remove in production)
    console.log("Full URL:", `${BASE_URL}/plan`);  // Debug: Confirm URL (remove in production)
    
    const response = await axios.post(`${BASE_URL}/plan`, data, {
      headers: getAuthHeaders(),
      timeout: 10000  // 10 seconds
    });
    console.log("Success response:", response.data);  // Debug: Log success (remove in production)
    return response.data;
  } catch (error) {
    console.error("Error generating plan:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw new Error(error.response?.data?.message || "Failed to generate diet plan. Please try again.");
  }
};

/* ============================
   Get the last diet plan
============================ */
export const getLastPlan = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/last`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error("Get Last Plan Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to retrieve last diet plan.");
  }
};

/* ============================
   Get full diet history
============================ */
export const getDietHistory = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/history`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error("Get Diet History Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to retrieve diet history.");
  }
};
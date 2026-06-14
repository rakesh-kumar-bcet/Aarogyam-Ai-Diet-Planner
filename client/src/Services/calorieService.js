import axios from "axios";
import API_BASE_URL from "../config/api";

export const logCalories = (meal, calories) => {
  return axios.post(
    `${API_BASE_URL}/api/calories/log`,
    { meal, calories },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );
};

export const getCalorieLogs = () => {
  return axios.get(`${API_BASE_URL}/api/calories/logs`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
};
import axios from "axios";

export const logCalories = (meal, calories) => {
  return axios.post(
    "/api/calories/log",
    { meal, calories },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );
};

export const getCalorieLogs = () => {
  return axios.get("/api/calories/logs", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
};
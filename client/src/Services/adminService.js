import axios from 'axios';
import API_BASE_URL from '../config/api';
const API = `${API_BASE_URL}/api/admin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

export const fetchLoginLogs = () => axios.get(`${API}/login-logs`, { headers: getAuthHeaders() });
export const fetchUserCounts = () => axios.get(`${API}/user-counts`, { headers: getAuthHeaders() });
export const fetchNutritionistSummary = () => axios.get(`${API}/nutritionists`, { headers: getAuthHeaders() });
export const fetchNutritionistDetails = (id) => axios.get(`${API}/nutritionists/${id}`, { headers: getAuthHeaders() });
export const fetchPatientDirectory = () => axios.get(`${API}/patients`, { headers: getAuthHeaders() });
export const fetchAdminFeedback = () => axios.get(`${API}/feedback`, { headers: getAuthHeaders() });
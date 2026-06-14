import axios from 'axios';
import API_BASE_URL from '../config/api';
const API = `${API_BASE_URL}/api/nutrenist`; // updated to match server endpoint

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

export const fetchUsers = () => axios.get(`${API}/users`, { headers: getAuthHeaders() });
export const updateUserRole = (id, role) =>
  axios.put(`${API}/users/${id}/role`, { role }, { headers: getAuthHeaders() });
export const deleteUser = (id) => axios.delete(`${API}/users/${id}`, { headers: getAuthHeaders() });
export const fetchLoginLogs = () => axios.get(`${API}/login-logs`, { headers: getAuthHeaders() });
export const fetchDietFollowers = () => axios.get(`${API}/diet-followers`, { headers: getAuthHeaders() });
export const fetchFeedback = () => axios.get(`${API}/feedback`, { headers: getAuthHeaders() });
export const fetchRatings = () => axios.get(`${API}/ratings`, { headers: getAuthHeaders() });
export const fetchNutritionists = () => axios.get(`${API}/nutritionists`);
export const fetchContactRequests = () => axios.get(`${API}/contact-requests`, { headers: getAuthHeaders() });
export const respondToContactRequest = (requestId, response, resolved = false) =>
  axios.post(
    `${API}/contact-requests/${requestId}/respond`,
    { response, resolved },
    { headers: getAuthHeaders() },
  );

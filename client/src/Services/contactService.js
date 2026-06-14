import axios from 'axios';
import API_BASE_URL from '../config/api';

const API = `${API_BASE_URL}/api/admin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

export const fetchContactHistory = () =>
  axios.get(`${API}/contact-history`, { headers: getAuthHeaders() });

export const resolveContactRequest = (requestId) =>
  axios.post(
    `${API}/resolve-contact-request`,
    { requestId },
    { headers: getAuthHeaders() },
  );

export const sendContactMessage = (requestId, message) =>
  axios.post(
    `${API}/send-contact-message`,
    { requestId, message },
    { headers: getAuthHeaders() },
  );

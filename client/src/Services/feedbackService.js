import axios from 'axios';
const API = '/api/feedback';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

export const submitFeedback = (nutritionistId, rating, comment) =>
  axios.post(API, { nutritionistId, rating, comment }, { headers: getAuthHeaders() });

export const getFeedbackForNutritionist = (nutritionistId) =>
  axios.get(`${API}/${nutritionistId}`);
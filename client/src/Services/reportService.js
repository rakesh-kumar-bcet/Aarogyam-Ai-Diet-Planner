import axios from 'axios';
import API_BASE_URL from '../config/api';
const API = `${API_BASE_URL}/api/report`;
export const downloadReport = (payload) => axios.post(`${API}/download`, payload, { responseType: 'blob' });

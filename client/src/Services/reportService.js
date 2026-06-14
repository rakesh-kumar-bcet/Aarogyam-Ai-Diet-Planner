import axios from 'axios';
const API = '/api/report';
export const downloadReport = (payload) => axios.post(`${API}/download`, payload, { responseType: 'blob' });

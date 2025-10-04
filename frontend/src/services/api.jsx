import axios from 'axios';

// IMPORTANT: Ensure this URL points to your running Backend API service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const postTrade = (tradeData) => api.post('/trades', tradeData);
export const getPositions = () => api.get('/positions');
export const getPnL = () => api.get('/pnl');

export default api;
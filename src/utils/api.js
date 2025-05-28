import axios from 'axios';

const API_URL = 'http://localhost:8080'; // Замените на ваш базовый URL

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const loginUser = async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
};

export const joinQueue = async (username) => {
    const response = await api.post('/api/v1/recruit/queue/join', { username });
    return response.data;
};

export default api;

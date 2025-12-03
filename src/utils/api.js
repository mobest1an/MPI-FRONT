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

export const getQueue = async () => {
    const response = await api.get('/api/v1/commissar/queue');
    return response.data;
};

export const removeFromQueue = async (username) => {
    await api.post('/api/v1/commissar/queue/delete', { username });
};

export const checkCommissarReady = async (username) => {
    const response = await api.get(`/api/v1/recruit/queue/ready/${encodeURIComponent(username)}`);
    return response.data; // Ожидается boolean
};

export const getEscortRoomUsers = async () => {
    const response = await api.get('/api/v1/escort/room');
    return response.data; // Ожидается массив объектов { username: string }
};

export const createConvoy = async () => {
    const response = await api.post('/api/v1/escort/room/delete');
    return response.data;
};

export const getSummonedUsers = async () => {
    const response = await api.get('/api/v1/commissar/room/summoned');
    return response.data;
};

export const addToEscortRoom = async (username) => {
    await api.post('/api/v1/commissar/room/add', { username });
};

export const checkUserInEscortRoom = async (username) => {
    const response = await api.get(`/api/v1/commissar/room/exists/${username}`);
    return response.data; // Ожидается boolean
};

export default api;

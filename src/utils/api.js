import axios from 'axios';

const API_URL = 'http://localhost:8080';

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

// ==================== Auth ====================

export const loginUser = async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
};

// ==================== Recruit ====================

export const joinQueue = async (username) => {
    const response = await api.post('/api/v1/recruit/queue/join', { username });
    return response.data;
};

export const checkCommissarReady = async (username) => {
    const response = await api.get(`/api/v1/recruit/queue/ready/${encodeURIComponent(username)}`);
    return response.data; // boolean
};

export const leaveQueue = async () => {
    await api.post('/api/v1/recruit/queue/leave');
};

export const getRecruitStatus = async () => {
    const response = await api.get('/api/v1/recruit/status');
    return response.data; // { status, militaryBranch }
};

// ==================== Commissar - Queue ====================

export const getQueue = async () => {
    const response = await api.get('/api/v1/commissar/queue');
    return response.data;
};

export const summonRecruit = async (username) => {
    await api.post('/api/v1/commissar/queue/summon', { username });
};

export const getCurrentSummoned = async () => {
    const response = await api.get('/api/v1/commissar/queue/current');
    return response.data; // { summonId, username } или null
};

export const hasSummonedRecruit = async () => {
    const response = await api.get('/api/v1/commissar/queue/has-summoned');
    return response.data; // boolean
};

export const rejectRecruit = async (username) => {
    await api.post('/api/v1/commissar/queue/reject', { username });
};

// ==================== Commissar - Waiting Room ====================

export const sendToWaitingRoom = async (username, militaryBranch) => {
    await api.post('/api/v1/commissar/room/send', { username, militaryBranch });
};

export const checkUserInWaitingRoom = async (username) => {
    const response = await api.get(`/api/v1/commissar/room/exists/${encodeURIComponent(username)}`);
    return response.data; // boolean
};

// ==================== Escort ====================

export const getWaitingRoom = async () => {
    const response = await api.get('/api/v1/escort/room');
    return response.data; // [{ summonId, username, militaryBranch }]
};

export const getActiveConvoy = async () => {
    const response = await api.get('/api/v1/escort/convoy');
    return response.data; // { convoyId, recruits: [...] } или null
};

export const hasActiveConvoy = async () => {
    const response = await api.get('/api/v1/escort/convoy/exists');
    return response.data; // boolean
};

export const createConvoy = async (summonIds) => {
    const response = await api.post('/api/v1/escort/convoy/create', { summonIds });
    return response.data;
};

export const dismissConvoy = async () => {
    await api.post('/api/v1/escort/convoy/dismiss');
};

export const getConvoyComplaintsCount = async () => {
    const response = await api.get('/api/v1/escort/convoy/complaints-count');
    return response.data; // number
};

// ==================== Public (Anonymous) ====================

export const getActiveConvoys = async () => {
    const response = await api.get('/api/v1/public/convoys');
    return response.data; // [{ convoyId, escortUsername }]
};

export const submitComplaint = async (convoyId) => {
    await api.post('/api/v1/public/complaint', { convoyId });
};

// ==================== Military Police ====================

export const getComplaints = async () => {
    const response = await api.get('/api/v1/military-police/complaints');
    return response.data; // [{ convoyId, escortUsername, complaintsCount, takenByOther }]
};

export const getActiveComplaint = async () => {
    const response = await api.get('/api/v1/military-police/complaints/active');
    return response.data; // { convoyId, escortUsername, recruitUsernames, complaintsCount } или null
};

export const takeComplaint = async (convoyId) => {
    await api.post(`/api/v1/military-police/complaints/${convoyId}/take`);
};

export const completeComplaint = async (convoyId) => {
    await api.post(`/api/v1/military-police/complaints/${convoyId}/complete`);
};

export const cancelComplaint = async (convoyId) => {
    await api.post(`/api/v1/military-police/complaints/${convoyId}/cancel`);
};

export default api;

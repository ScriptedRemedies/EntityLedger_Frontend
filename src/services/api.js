import axios from 'axios';

// Establishes the base connection to your Spring Boot server
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Intercepts every outgoing request to inject the authorization token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('entity_jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

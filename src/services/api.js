import axios from 'axios';

// Establishes the base connection to your Spring Boot server
const api = axios.create({
    // If VITE_API_BASE_URL is defined (production), use it. Otherwise, use an empty string
    // so it uses the Vite proxy during local development.
    baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/api/v1',
    withCredentials: true // Crucial: Tells Axios to include the Spring Boot session cookie
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.message === 'Network Error') {

            // 1. Check if they are already on the login page. If not, save their location.
            if (window.location.pathname !== '/') {
                localStorage.setItem('returnPath', window.location.pathname);
            }

            console.warn("Session expired or unauthorized. Redirecting to login...");

            // 2. Kick them back to your React login page
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

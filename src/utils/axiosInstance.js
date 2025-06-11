import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';

// Create a reusable Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Your backend API URL
  withCredentials: true, // Send cookies if needed
});

// Add access token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler for 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = getAuth();
      try {
        await signOut(auth);
        window.location.href = '/login';
      } catch (signOutError) {
        console.error('Auto-logout failed:', signOutError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

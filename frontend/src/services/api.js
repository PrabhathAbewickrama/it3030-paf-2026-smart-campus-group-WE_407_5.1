import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Adjust as needed
});

// Add interceptors for auth if needed

export default api;
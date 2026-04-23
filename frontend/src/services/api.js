import axios from 'axios';

const AUTH_STORAGE_KEY = 'smartcampus_auth_user';

const api = axios.create({
    baseURL: 'http://localhost:8081',
});

api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedUser) {
        try {
            const currentUser = JSON.parse(storedUser);

            if (currentUser?.id && currentUser?.username && currentUser?.role) {
                config.headers['X-User-Id'] = String(currentUser.id);
                config.headers['X-User-Name'] = currentUser.username;
                config.headers['X-User-Role'] = currentUser.role;
            }
        } catch (error) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }

    return config;
});

export default api;

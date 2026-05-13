import axios from 'axios';

// Instancia base de Axios para tu API NestJS
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // habilítalo si usas cookies
});

export function setAuthToken(token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken() {
    delete api.defaults.headers.common['Authorization'];
}

// Manejo global de errores 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
        // Puedes redirigir al login o limpiar token
        localStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
    }
);
export default api;
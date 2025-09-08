import axios from 'axios';
import { getToken, setToken, setRefreshToken, clearTokens } from '../hooks/tokenStorage';

// สร้าง axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// เพิ่ม interceptor สำหรับการส่ง request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// เพิ่ม interceptor สำหรับการรับ response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ถ้าเป็น error 401 (Unauthorized) และไม่ได้เป็นการพยายาม refresh token อยู่แล้ว
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // พยายาม refresh token
        const refreshResponse = await axios.post('http://localhost:3000/api/refresh-token', {
          token: getToken(),
        });
        
        // อัปเดต token ใหม่
        const { token, refreshToken } = refreshResponse.data;
        setToken(token);
        setRefreshToken(refreshToken);
        
        // ส่ง request เดิมอีกครั้งด้วย token ใหม่
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // ถ้า refresh token ไม่สำเร็จ ให้ logout
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 
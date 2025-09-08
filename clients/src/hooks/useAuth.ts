import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  getToken, 
  getRefreshToken, 
  setToken, 
  setRefreshToken, 
  clearTokens, 
  getUser, 
  setUser, 
  clearUser 
} from './tokenStorage';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<any>(null);

  useEffect(() => {
    const storedToken = getToken();
    const storedRefreshToken = getRefreshToken();
    const storedUser = getUser();
    
    if (storedToken) {
      setTokenState(storedToken);
      setRefreshTokenState(storedRefreshToken);
      setUserState(storedUser);
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await axios.get('http://localhost:3000/api/validate-token', {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`
        }
      });
      
      setIsAuthenticated(response.data.valid);
      if (response.data.valid) {
        setUserState(response.data.user);
        setUser(response.data.user);
      } else {
        // หาก token ไม่ถูกต้อง ลองใช้ refresh token
        const storedRefreshToken = getRefreshToken();
        if (storedRefreshToken) {
          await refreshAccessToken(storedRefreshToken);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // ลองใช้ refresh token เมื่อเกิดข้อผิดพลาด
      const storedRefreshToken = getRefreshToken();
      if (storedRefreshToken) {
        try {
          await refreshAccessToken(storedRefreshToken);
        } catch (refreshError) {
          console.error('Refresh token error:', refreshError);
          logout();
        }
      } else {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async (refreshTokenValue: string) => {
    try {
      const response = await axios.post('http://localhost:3000/api/refresh-token', {
        token: refreshTokenValue
      });
      
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      
      // ใช้ฟังก์ชันจาก tokenStorage
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      
      setTokenState(newToken);
      setRefreshTokenState(newRefreshToken);
      setIsAuthenticated(true);
      
      // ตรวจสอบ token ใหม่เพื่อรับข้อมูลผู้ใช้
      await validateToken(newToken);
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  const login = (newToken: string, newRefreshToken: string, userData: any) => {
    // ใช้ฟังก์ชันจาก tokenStorage
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
    
    setTokenState(newToken);
    setRefreshTokenState(newRefreshToken);
    setUserState(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // เรียก API logout เพื่อยกเลิก token ในฐานข้อมูล
      const currentToken = getToken();
      const currentRefreshToken = getRefreshToken();
      
      if (currentToken) {
        await axios.post('http://localhost:3000/api/logout', 
          { refreshToken: currentRefreshToken },
          {
            headers: {
              Authorization: `Bearer ${currentToken}`
            }
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ลบ token ทั้งหมด
      clearTokens();
      clearUser();
      
      setTokenState(null);
      setRefreshTokenState(null);
      setUserState(null);
      setIsAuthenticated(false);
    }
  };

  return { 
    isAuthenticated, 
    isLoading, 
    token, 
    refreshToken, 
    user, 
    login, 
    logout, 
    refreshAccessToken 
  };
};

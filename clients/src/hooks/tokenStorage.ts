// tokenStorage.ts
// ไฟล์นี้เป็นศูนย์กลางในการจัดการ token storage

// ใช้ sessionStorage สำหรับเก็บ token (ปลอดภัยกว่า localStorage)
export const getToken = (): string | null => {
  return sessionStorage.getItem('jwtToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
};

export const getRefreshToken = (): string | null => {
  return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
};

export const setToken = (token: string): void => {
  // ลบ token เก่าจาก localStorage เพื่อความปลอดภัย
  localStorage.removeItem('token');
  localStorage.removeItem('jwtToken');
  
  // เก็บใน sessionStorage
  sessionStorage.setItem('jwtToken', token);
};

export const setRefreshToken = (refreshToken: string): void => {
  // ลบ token เก่าจาก localStorage เพื่อความปลอดภัย
  localStorage.removeItem('refreshToken');
  
  // เก็บใน sessionStorage
  sessionStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = (): void => {
  // ลบทั้ง localStorage และ sessionStorage
  localStorage.removeItem('token');
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('refreshToken');
  
  sessionStorage.removeItem('jwtToken');
  sessionStorage.removeItem('refreshToken');
};

// ฟังก์ชันสำหรับเก็บข้อมูลผู้ใช้
export const getUser = (): any => {
  const userString = sessionStorage.getItem('user') || localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const setUser = (user: any): void => {
  localStorage.removeItem('user');
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const clearUser = (): void => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
}; 
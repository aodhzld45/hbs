// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        // 초기값을 localStorage에서 읽어오도록 설정 (예: "true" 문자열)
        const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
          localStorage.getItem('isAuthenticated') === 'true'
        );

        const login = () => {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
        };

        const logout = () => {
          setIsAuthenticated(false);
          localStorage.setItem('isAuthenticated', 'false');
        };

        // 또는, 앱 시작 시 세션 검증 API를 호출하여 인증 상태를 확인할 수 있습니다.
        useEffect(() => {
          // 예를 들어, fetchSessionStatus()를 호출하여 인증 상태를 업데이트할 수 있음.
        }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

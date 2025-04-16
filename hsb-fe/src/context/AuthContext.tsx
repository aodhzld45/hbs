// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  checkSession: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 앱 시작 시 백엔드 세션 체크
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/session-check", {
        method: "GET",
        credentials: "include", // 쿠키 포함 요청
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("세션 체크 실패:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 API 호출 후 성공 시 호출 (세션 생성 후 호출)
  const login = () => {
    setIsAuthenticated(true);
  };

  // 로그아웃 시 서버에 로그아웃 API 호출 후 상태 업데이트
  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

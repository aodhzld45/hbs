import React, { createContext, useState, useEffect, useContext } from "react";
import { Admin } from "../types/Admin/Admin";
import api from "../services/api"; // axios 인스턴스

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin?: Admin;
  login: (admin: Admin, token: string) => void;
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
  const [admin, setAdmin] = useState<Admin | undefined>(undefined);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setIsAuthenticated(false);
      setAdmin(undefined);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get("/admin/me"); // JWT 포함 요청
      setAdmin(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("세션 체크 실패:", error);
      setIsAuthenticated(false);
      setAdmin(undefined);
      localStorage.removeItem("jwtToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = (adminData: Admin, token: string) => {
    setIsAuthenticated(true);
    setAdmin(adminData);
    localStorage.setItem("jwtToken", token);
  };

  const logout = async () => {
    // JWT 기반이므로 서버에 요청 없이 클라이언트에서 로그아웃 처리
    setIsAuthenticated(false);
    setAdmin(undefined);
    localStorage.removeItem("jwtToken");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, admin, login, logout, checkSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

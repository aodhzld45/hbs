// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { Admin } from "../types/Admin/Admin";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin?: Admin;
  login: (admin: Admin) => void;
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

  // 앱 시작 시 세션 체크 (예시)
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/session-check", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        // 예시로, 세션이 유효하면 localStorage에 저장된 admin 정보를 가져올 수도 있음.
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }
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

  const login = (adminData: Admin) => {
    setIsAuthenticated(true);
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setIsAuthenticated(false);
        setAdmin(undefined);
        localStorage.removeItem("admin");
        localStorage.removeItem("isAuthenticated");
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, admin, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

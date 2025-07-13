import React, { createContext, useState, useEffect, useContext } from "react";
import { Admin } from "../types/Admin/Admin";
import api from "../services/api";

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
      // /me 호출 → JWT 포함
      const response = await api.get("/admin/me");

      /**
       * 만약 백엔드 /me 응답이
       * {
       *    adminId: "...",
       *    name: "...",
       *    email: "...",
       *    roles: ["ROLE_ADMIN"]
       * }
       * 라면 아래처럼 admin 객체로 변환해줘야 한다.
       */
      setAdmin({
        id: response.data.adminId,
        name: response.data.name,
        email: response.data.email,
        groupId: response.data.groupId, // 필요 없다면 null
        isDeleted: false,
      });

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
    try {
      await api.post("/admin/logout");
    } catch (error) {
      console.error("서버 로그아웃 실패:", error);
      // 서버가 죽었거나, 인증 만료된 경우 무시하고 클라이언트 토큰만 제거
    } finally {
      setIsAuthenticated(false);
      setAdmin(undefined);
      localStorage.removeItem("jwtToken");
    }
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

// src/context/PermissionContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { MenuPermission } from '../types/Admin/RoleGroup';

interface PermissionContextType {
  refreshToken: number;
  triggerRefresh: () => void;
  menuPermissions: MenuPermission[] | null;
  setMenuPermissions: (perms: MenuPermission[] | null) => void;
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
}

const PermissionContext = createContext<PermissionContextType>({
  refreshToken: 0,
  triggerRefresh: () => {},
  menuPermissions: null,
  setMenuPermissions: () => {},
  isLoaded: false,
  setIsLoaded: () => {},
});

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshToken, setRefreshToken] = useState(0);
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
    setIsLoaded(false); // 새로 불러오도록 플래그 초기화
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        refreshToken,
        triggerRefresh,
        menuPermissions,
        setMenuPermissions,
        isLoaded,
        setIsLoaded,
      }}
    >      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);

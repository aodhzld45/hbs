// src/context/PermissionContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface PermissionContextType {
  refreshToken: number;
  triggerRefresh: () => void;
}

const PermissionContext = createContext<PermissionContextType>({
  refreshToken: 0,
  triggerRefresh: () => {},
});

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshToken, setRefreshToken] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1); // 숫자를 증가시켜 refresh 감지
  }, []);

  return (
    <PermissionContext.Provider value={{ refreshToken, triggerRefresh }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);

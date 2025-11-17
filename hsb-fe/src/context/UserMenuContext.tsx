import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserMenuNode } from '../types/Admin/UserMenuNode';
import { fetchUserMenuTree } from '../services/Admin/userMenuApi';

type UserMenuContextType = {
  menuTree: UserMenuNode[];
  loading: boolean;
  hasPathAccess: (path: string) => boolean;
};

const UserMenuContext = createContext<UserMenuContextType | undefined>(undefined);

export function UserMenuProvider({ children }: { children: React.ReactNode }) {
  const [menuTree, setMenuTree] = useState<UserMenuNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTree = async () => {
      try {
        // 여기서 onlyUsable = true → use_tf = 'Y' 인 메뉴만
        const data = await fetchUserMenuTree(true);
        setMenuTree(data);
      } catch (err) {
        console.error('사용자 메뉴 트리 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTree();
  }, []);

  // 트리 안에서 path가 존재하는지 재귀로 검사
  const hasPathAccess = (path: string) => {
    const normalized = path.replace(/\/+$/, '');

    const dfs = (nodes: UserMenuNode[] | undefined): boolean => {
      if (!nodes) return false;
      for (const node of nodes) {
        const nodePath = node.url?.replace(/\/+$/, '');
        if (nodePath && nodePath === normalized) {
          return true;
        }
        if (node.children && dfs(node.children)) {
          return true;
        }
      }
      return false;
    };

    return dfs(menuTree);
  };

  return (
    <UserMenuContext.Provider value={{ menuTree, loading, hasPathAccess }}>
      {children}
    </UserMenuContext.Provider>
  );
}

export function useUserMenus() {
  const ctx = useContext(UserMenuContext);
  if (!ctx) throw new Error('useUserMenus must be used within UserMenuProvider');
  return ctx;
}

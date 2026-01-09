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

  const normalizePath = (p: string) => {
    const x = (p ?? "").trim();
    if (!x) return "";
    const noTrail = x.replace(/\/+$/, "");
    return noTrail === "" ? "/" : noTrail;
  };
  
  const deriveBases = (url: string) => {
    const u = normalizePath(url);
    const bases: string[] = [];
    if (!u) return bases;
  
    // 원본도 base로 포함
    bases.push(u);
  
    // list/detail 같은 “화면용 suffix”가 있으면 상위 base도 허용
    const suffixes = [
      "/list",
      "/detail",
      "/board-list",
      "/board-detail",
    ];
  
    for (const s of suffixes) {
      if (u.endsWith(s)) {
        const base = u.slice(0, -s.length);
        if (base) bases.push(base);
      }
    }
  
    return bases;
  };

  // 트리 안에서 path가 존재하는지 검사 부분
  const hasPathAccess = (path: string) => {
    const normalized = normalizePath(path);
  
    // 혹시 "/"가 들어오면 공개로 처리하고 싶으면 여기서 true 처리 가능
    // if (normalized === "/") return true;
    const dfs = (nodes: UserMenuNode[] | undefined): boolean => {
      if (!nodes) return false;
  
      for (const node of nodes) {
        const nodeUrl = node.url;
        if (nodeUrl) {
          const bases = deriveBases(nodeUrl);
  
          for (const base of bases) {
            // "/"는 prefix 허용하면 전체 허용이 되니 prefix에서 제외
            if (base === "/") {
              if (normalized === "/") return true;
              continue;
            }
  
            // exact 허용
            if (normalized === base) return true;
  
            // prefix 허용 (하위 경로 모두 허용)
            if (normalized.startsWith(base + "/")) return true;
          }
        }
  
        if (node.children && dfs(node.children)) return true;
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

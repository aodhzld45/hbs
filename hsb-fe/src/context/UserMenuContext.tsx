import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserMenuNode } from "../types/Admin/UserMenuNode";
import { fetchUserMenuTree } from "../services/Admin/userMenuApi";

type UserMenuContextType = {
  menuTree: UserMenuNode[];
  loading: boolean;
  hasPathAccess: (path: string) => boolean;
};

const UserMenuContext = createContext<UserMenuContextType | undefined>(undefined);

const normalizePath = (p: string) => {
  const x = (p ?? "").trim();
  if (!x) return "";
  const cleaned = x.split("?")[0].split("#")[0];
  const noTrail = cleaned.replace(/\/+$/, "");
  return noTrail === "" ? "/" : noTrail;
};

const withoutLeadingMenuSegment = (path: string) => {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
    return '/' + parts.slice(1).join('/');
  }
  return normalized;
};

const deriveBases = (url: string) => {
  const variants = new Set<string>();
  const normalized = normalizePath(url);
  const alias = withoutLeadingMenuSegment(normalized);

  if (normalized) {
    variants.add(normalized);
  }
  if (alias && alias !== normalized) {
    variants.add(alias);
  }

  const bases: string[] = [];
  const suffixes = [
    "/list",
    "/detail",
    "/board-list",
    "/board-detail",
    "/write",
    "/edit",
  ];

  variants.forEach((u) => {
    bases.push(u);
    for (const s of suffixes) {
      if (u.endsWith(s)) {
        const base = u.slice(0, -s.length);
        if (base) bases.push(base);
      }
    }
  });

  return Array.from(new Set(bases));
};

function collectBaseSet(nodes: UserMenuNode[] | undefined, set: Set<string>) {
  if (!nodes) return;

  for (const node of nodes) {
    if (node.url) {
      const bases = deriveBases(node.url);
      for (const b of bases) {
        if (b) set.add(b);
      }
    }
    if (node.children?.length) {
      collectBaseSet(node.children, set);
    }
  }
}

export function UserMenuProvider({ children }: { children: React.ReactNode }) {
  const [menuTree, setMenuTree] = useState<UserMenuNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTree = async () => {
      try {
        const data = await fetchUserMenuTree(true);
        setMenuTree(data);
      } catch (err) {
        console.error("사용자 메뉴 트리 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTree();
  }, []);

  const allowedBaseSet = useMemo(() => {
    const s = new Set<string>();
    collectBaseSet(menuTree, s);
    return s;
  }, [menuTree]);

  const hasPathAccess = (path: string) => {
    const normalized = normalizePath(path);
    const alias = withoutLeadingMenuSegment(normalized);
    const candidates = Array.from(new Set([normalized, alias]));

    if (candidates.includes('/')) {
      return allowedBaseSet.has('/');
    }

    for (const candidate of candidates) {
      for (const base of Array.from(allowedBaseSet)) {
        if (!base || base === '/') continue;
        if (candidate === base) return true;
        if (candidate.startsWith(base + '/')) return true;
      }
    }

    return false;
  };

  return (
    <UserMenuContext.Provider value={{ menuTree, loading, hasPathAccess }}>
      {children}
    </UserMenuContext.Provider>
  );
}

export function useUserMenus() {
  const ctx = useContext(UserMenuContext);
  if (!ctx) throw new Error("useUserMenus must be used within UserMenuProvider");
  return ctx;
}
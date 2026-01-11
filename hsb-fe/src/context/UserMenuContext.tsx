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
  // 쿼리/해시 들어오는 케이스 방어(혹시라도)
  const cleaned = x.split("?")[0].split("#")[0];
  const noTrail = cleaned.replace(/\/+$/, "");
  return noTrail === "" ? "/" : noTrail;
};

const deriveBases = (url: string) => {
  const u = normalizePath(url);
  const bases: string[] = [];
  if (!u) return bases;

  // 원본도 base로 포함
  bases.push(u);

  // 화면용 suffix가 있으면 상위 base도 허용
  // (필요하면 suffix 추가)
  const suffixes = [
    "/list",
    "/detail",
    "/board-list",
    "/board-detail",
    "/write",
    "/edit",
  ];

  for (const s of suffixes) {
    if (u.endsWith(s)) {
      const base = u.slice(0, -s.length);
      if (base) bases.push(base);
    }
  }

  return bases;
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
        // onlyUsable = true → use_tf='Y' 인 메뉴만
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

  // menuTree로부터 “허용 base 경로 Set” 생성 (성능/일관성)
  const allowedBaseSet = useMemo(() => {
    const s = new Set<string>();
    collectBaseSet(menuTree, s);
    return s;
  }, [menuTree]);

  // 최종 판정 로직
  const hasPathAccess = (path: string) => {
    const normalized = normalizePath(path);
    if (!normalized) return false;

    // "/"는 prefix로 취급하면 전체 허용이 되므로 별도 처리
    if (normalized === "/") return allowedBaseSet.has("/") || false;

    // Set을 Array로 변환하여 for..of 루프를 지원하지 않는 환경에서 반복 가능하도록 수정
    for (const base of Array.from(allowedBaseSet)) { // 수정된 부분
      if (!base) continue;

      // "/"는 prefix 제외
      if (base === "/") continue;

      // exact
      if (normalized === base) return true;

      // prefix (하위 전부 허용)
      if (normalized.startsWith(base + "/")) return true;
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

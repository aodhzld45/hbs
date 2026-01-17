import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchAdminMenus } from "../../../../services/Admin/adminMenuApi";
import type { AdminMenu } from "../../../../types/Admin/AdminMenu";

export function useAdminMenus() {
  const location = useLocation();

  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string>("");

  const loadMenus = useCallback(async () => {
    try {
      setMenuLoading(true);
      setMenuError("");
      const data = await fetchAdminMenus();
      setMenus(data);
    } catch (e) {
      console.error(e);
      setMenuError("메뉴 목록을 불러오는데 실패했습니다.");
    } finally {
      setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  const currentMenuTitle = useMemo(() => {
    const matched = menus.find((m) => m.url === location.pathname);
    return matched ? matched.name : null;
  }, [menus, location.pathname]);

  return {
    menus,
    menuLoading,
    menuError,
    currentMenuTitle,
    reloadMenus: loadMenus,
  };
}

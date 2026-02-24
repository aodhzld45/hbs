import { useCallback, useEffect, useState } from "react";
import { fetchAdminMenus } from "../../../../services/Admin/adminMenuApi";
import type { AdminMenu } from "../../../../types/Admin/AdminMenu";
import { useCurrentPageTitle } from "./useCurrentPageTitle";

export function useAdminMenus() {
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string>("");

  const currentMenuTitle = useCurrentPageTitle();

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

  return {
    menus,
    menuLoading,
    menuError,
    currentMenuTitle,
    reloadMenus: loadMenus,
  };
}

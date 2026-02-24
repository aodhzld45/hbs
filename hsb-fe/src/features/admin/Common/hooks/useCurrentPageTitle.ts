import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { usePermission } from "../../../../context/PermissionContext";

/**
 * 현재 pathname에 해당하는 메뉴 이름을 PermissionContext의 menuPermissions에서 조회합니다.
 * (메뉴 데이터 일원화: fetchAdminMenus 대신 권한 메뉴 기준으로 제목 표시)
 */
export function useCurrentPageTitle(): string | null {
  const { menuPermissions } = usePermission();
  const { pathname } = useLocation();
  const permissions = menuPermissions ?? [];

  return useMemo(() => {
    if (permissions.length === 0) return null;
    // 가장 구체적인 매칭(가장 긴 url) 선택
    const matched = permissions
      .filter(
        (m) =>
          pathname === m.url || pathname.startsWith(m.url + "/")
      )
      .sort((a, b) => b.url.length - a.url.length)[0];
    return matched ? matched.name : null;
  }, [permissions, pathname]);
}

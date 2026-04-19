import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { usePermission } from "../../../../context/PermissionContext";

const normalizePath = (path?: string) => (path ? path.replace(/\/+$/, '').toLowerCase() : '');

export function useCurrentPageTitle(): string | null {
  const { menuPermissions } = usePermission();
  const { pathname } = useLocation();
  const permissions = menuPermissions ?? [];

  return useMemo(() => {
    if (permissions.length === 0) return null;

    const normalizedPathname = normalizePath(pathname);
    const matched = permissions
      .filter((m) => {
        const normalizedMenuUrl = normalizePath(m.url);
        return (
          normalizedMenuUrl &&
          (normalizedPathname === normalizedMenuUrl ||
            normalizedPathname.startsWith(normalizedMenuUrl + "/"))
        );
      })
      .sort((a, b) => normalizePath(b.url).length - normalizePath(a.url).length)[0];

    return matched ? matched.name : null;
  }, [permissions, pathname]);
}

import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { fetchRoleMenus } from '../../services/Admin/roleApi';

// import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../context/PermissionContext';
import { MenuPermission } from '../../types/Admin/RoleGroup';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const normalizePath = (path?: string) => (path ? path.replace(/\/+$/, '').toLowerCase() : '');

const AdminSidebar: React.FC<Props> = ({ isOpen, toggleSidebar }) => {
  const {
    refreshToken,
    menuPermissions,
    setMenuPermissions,
    isLoaded,
    setIsLoaded,
  } = usePermission();

  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const location = useLocation();
  const admin = useAuthStore((state) => state.admin);

  // const auth = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!isLoaded && admin?.groupId) {
          const roleMenuRes = await fetchRoleMenus(admin.groupId);
          const readPermissions = roleMenuRes.menuPermissions?.filter((m) => m.read) || [];
          setMenuPermissions(readPermissions);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load sidebar permissions:', error);
      }
    };
    loadData();
  }, [admin?.groupId, isLoaded, refreshToken, setMenuPermissions, setIsLoaded]);

  const permissions = menuPermissions || [];

  useEffect(() => {
    const normalizedPathname = normalizePath(location.pathname);
    const matched = permissions
      .filter((menu) => {
        const normalizedMenuUrl = normalizePath(menu.url);
        return (
          menu.depth === 2 &&
          normalizedMenuUrl &&
          (normalizedPathname === normalizedMenuUrl ||
            normalizedPathname.startsWith(`${normalizedMenuUrl}/`))
        );
      })
      .sort((a, b) => normalizePath(b.url).length - normalizePath(a.url).length)[0];

    if (matched) {
      setSelectedParent(matched.parentId ?? null);
    }
  }, [location.pathname, permissions]);

  const topMenus = permissions
    .filter((menu) => menu.depth === 1)
    .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0));

  const secondMenus = permissions
    .filter((menu) => menu.depth === 2 && menu.parentId === selectedParent)
    .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0));

  return (
    <aside
      className={`
        h-full bg-gray-100 border-r transition-all duration-300
        fixed top-0 left-0 z-50 md:static md:z-auto
        shrink-0
        ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
      `}
    >
      <div className="p-4 flex justify-between items-center bg-white border-b md:hidden">
        <button onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {topMenus.map((menu) => {
          const isSelected = selectedParent === menu.menuId;

          return (
            <div key={menu.menuId}>
              <button
                onClick={() =>
                  setSelectedParent((prev) => (prev === menu.menuId ? null : menu.menuId))
                }
                className={`border block w-full text-left p-2 rounded font-semibold
                  ${isSelected ? 'bg-blue-100 text-blue-600 font-bold' : 'hover:bg-gray-200'}
                `}
              >
                {menu.name}
              </button>

              {isSelected && isOpen && (
                <div className="ml-4">
                  {secondMenus.map((child) => {
                    const normalizedPathname = normalizePath(location.pathname);
                    const normalizedChildUrl = normalizePath(child.url);
                    const isActive =
                      normalizedPathname === normalizedChildUrl ||
                      normalizedPathname.startsWith(`${normalizedChildUrl}/`);

                    return (
                      <Link
                        key={child.menuId}
                        to={child.url}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            toggleSidebar();
                          }
                        }}
                        className={`block p-1 text-sm rounded border-b last:border-0 ${
                          isActive
                            ? 'bg-blue-100 text-blue-600 font-bold'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        - {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

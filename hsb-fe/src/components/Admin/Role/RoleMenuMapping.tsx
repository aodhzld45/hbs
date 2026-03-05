import React, { useEffect, useState, useRef } from 'react';
import { RoleGroup, MenuMapping } from '../../../types/Admin/RoleGroup';
import {
  fetchMenus,
  fetchRoleMenus,
  saveRoleMenus,
} from '../../../services/Admin/roleApi';
import { ToastType } from './Toast';

interface AdminMenu {
  id: number;
  name: string;
}

type PermissionField = keyof Omit<MenuMapping, 'menuId'>;

interface RoleMenuMappingProps {
  roles: RoleGroup[];
  rolesLoading: boolean;
  showToast: (message: string, type?: ToastType) => void;
}

const RoleMenuMapping: React.FC<RoleMenuMappingProps> = ({
  roles,
  rolesLoading,
  showToast,
}) => {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [menuMappings, setMenuMapping] = useState<MenuMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copySourceRoleId, setCopySourceRoleId] = useState<number | null>(null);
  const initialMappingsRef = useRef<MenuMapping[]>([]);

  // 전체 메뉴 로딩 (한 번만)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const menusRes = await fetchMenus();
        if (mounted) setMenus(menusRes);
      } catch (e) {
        console.error(e);
        showToast('메뉴 목록을 불러오지 못했습니다.', 'error');
      }
    };
    load();
    return () => { mounted = false; };
  }, [showToast]);

  // 권한 그룹 선택 시 해당 권한의 메뉴 목록 조회
  useEffect(() => {
    if (selectedRoleId == null || menus.length === 0) {
      if (selectedRoleId == null) {
        setMenuMapping([]);
        initialMappingsRef.current = [];
      }
      return;
    }
    let mounted = true;
    setLoading(true);
    fetchRoleMenus(selectedRoleId)
      .then((res) => {
        if (!mounted) return;
        const existingPermissions = res.menuPermissions || [];
        const initialized: MenuMapping[] = menus.map((menu) => {
          const matched = existingPermissions.find((p) => p.menuId === menu.id);
          return matched
            ? {
                menuId: menu.id,
                read: matched.read,
                write: matched.write,
                delete: matched.delete,
              }
            : { menuId: menu.id, read: false, write: false, delete: false };
        });
        setMenuMapping(initialized);
        initialMappingsRef.current = initialized.map((m) => ({ ...m }));
      })
      .catch(() => {
        if (mounted) showToast('메뉴 권한을 불러오지 못했습니다.', 'error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [selectedRoleId, menus, showToast]);

  const hasUnsavedChanges = () => {
    const initial = initialMappingsRef.current;
    if (initial.length !== menuMappings.length) return true;
    return menuMappings.some((m) => {
      const i = initial.find((x) => x.menuId === m.menuId);
      return !i || i.read !== m.read || i.write !== m.write || i.delete !== m.delete;
    });
  };

  const handleSelectRole = (roleId: number) => {
    if (selectedRoleId === roleId) return;
    if (selectedRoleId != null && hasUnsavedChanges()) {
      const proceed = window.confirm('저장하지 않은 변경사항이 있습니다. 이동하시겠습니까?');
      if (!proceed) return;
    }
    setSelectedRoleId(roleId);
  };

  const togglePermission = (menuId: number, field: PermissionField) => {
    setMenuMapping((prev) =>
      prev.map((item) =>
        item.menuId === menuId ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const setAllForColumn = (field: PermissionField, value: boolean) => {
    setMenuMapping((prev) => prev.map((item) => ({ ...item, [field]: value })));
  };

  const handleCopyFromRole = () => {
    if (copySourceRoleId == null || selectedRoleId == null) {
      showToast('복사할 권한 그룹을 선택해주세요.', 'error');
      return;
    }
    if (copySourceRoleId === selectedRoleId) {
      showToast('현재 선택한 그룹과 동일합니다.', 'info');
      return;
    }
    setLoading(true);
    fetchRoleMenus(copySourceRoleId)
      .then((res) => {
        const existing = res.menuPermissions || [];
        const merged: MenuMapping[] = menus.map((menu) => {
          const m = existing.find((p) => p.menuId === menu.id);
          return m
            ? { menuId: menu.id, read: m.read, write: m.write, delete: m.delete }
            : { menuId: menu.id, read: false, write: false, delete: false };
        });
        setMenuMapping(merged);
        initialMappingsRef.current = merged.map((m) => ({ ...m }));
        showToast('선택한 권한 그룹의 메뉴 권한을 불러왔습니다. 저장 버튼으로 반영해주세요.', 'success');
      })
      .catch(() => showToast('권한을 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    if (selectedRoleId == null) return;
    setSaving(true);
    try {
      await saveRoleMenus(selectedRoleId, menuMappings);
      initialMappingsRef.current = menuMappings.map((m) => ({ ...m }));
      showToast('메뉴 권한이 저장되었습니다.', 'success');
    } catch (e) {
      console.error(e);
      showToast('메뉴 권한 저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const allRead = menuMappings.length > 0 && menuMappings.every((m) => m.read);
  const allWrite = menuMappings.length > 0 && menuMappings.every((m) => m.write);
  const allDelete = menuMappings.length > 0 && menuMappings.every((m) => m.delete);

  return (
    <div className="flex gap-6">
      {/* 좌측: 권한 그룹 */}
      <div className="w-1/3 border-r pr-4">
        <h2 className="font-bold text-lg mb-4">권한 그룹</h2>
        {rolesLoading ? (
          <div className="text-gray-500 py-4">로딩 중...</div>
        ) : (
          <ul className="space-y-1">
            {roles.map((role) => (
              <li
                key={role.id}
                className={`p-2 cursor-pointer rounded hover:bg-blue-100 ${
                  selectedRoleId === role.id ? 'bg-blue-200 font-semibold' : ''
                } ${role.useTf === 'N' ? 'opacity-70' : ''}`}
                onClick={() => handleSelectRole(role.id!)}
              >
                {role.name}
                {role.useTf === 'N' && (
                  <span className="ml-1 text-xs text-gray-500">(미사용)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 우측: 메뉴 권한 매핑 */}
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-lg mb-4">메뉴 권한 매핑</h2>

        {selectedRoleId == null ? (
          <p className="text-gray-500">좌측에서 권한 그룹을 선택해주세요.</p>
        ) : loading ? (
          <div className="py-8 text-gray-500">로딩 중...</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">다른 역할에서 복사:</span>
                <select
                  value={copySourceRoleId ?? ''}
                  onChange={(e) => setCopySourceRoleId(e.target.value ? Number(e.target.value) : null)}
                  className="border rounded px-2 py-1.5 text-sm"
                >
                  <option value="">선택</option>
                  {roles
                    .filter((r) => r.id !== selectedRoleId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleCopyFromRole}
                  className="px-3 py-1.5 text-sm bg-gray-100 border rounded hover:bg-gray-200"
                >
                  복사
                </button>
              </div>
              {hasUnsavedChanges() && (
                <span className="text-amber-600 text-sm">저장하지 않은 변경사항이 있습니다.</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border-b">메뉴명</th>
                    <th className="p-2 border-b text-center w-20">
                      <label className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allRead}
                          onChange={(e) => setAllForColumn('read', e.target.checked)}
                        />
                        읽기
                      </label>
                    </th>
                    <th className="p-2 border-b text-center w-20">
                      <label className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allWrite}
                          onChange={(e) => setAllForColumn('write', e.target.checked)}
                        />
                        쓰기
                      </label>
                    </th>
                    <th className="p-2 border-b text-center w-20">
                      <label className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allDelete}
                          onChange={(e) => setAllForColumn('delete', e.target.checked)}
                        />
                        삭제
                      </label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => {
                    const perm =
                      menuMappings.find((p) => p.menuId === menu.id) ?? {
                        menuId: menu.id,
                        read: false,
                        write: false,
                        delete: false,
                      };
                    return (
                      <tr key={menu.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{menu.name}</td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={perm.read}
                            onChange={() => togglePermission(menu.id, 'read')}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={perm.write}
                            onChange={() => togglePermission(menu.id, 'write')}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={perm.delete}
                            onChange={() => togglePermission(menu.id, 'delete')}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleMenuMapping;

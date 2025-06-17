import React, { useEffect, useState } from 'react';
import { UserMenuNode } from '../../../types/Admin/UserMenuNode';
import { fetchUserMenuTree } from '../../../services/Admin/userMenuApi';
import UserMenuForm from '../../../components/Admin/Menu/UserMenuForm';
import AdminLayout from '../../../components/Layout/AdminLayout';
import UserMenuTreeView from '../../../components/Admin/Menu/UserMenuTreeView ';

const UserMenuManager: React.FC = () => {
  const [menuTree, setMenuTree] = useState<UserMenuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<UserMenuNode | null>(null); // 수정 대상
  const [isModalOpen, setModalOpen] = useState(false);

  const loadTree = async () => {
    try {
      const data = await fetchUserMenuTree();
      setMenuTree(data);
    } catch (err) {
      console.error('메뉴 트리 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);
  

  const handleSuccess = () => {
    loadTree();
    setSelectedMenu(null); // 수정폼 초기화
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">사용자 메뉴 관리</h2>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-2">📂 메뉴 트리</h3>
              <UserMenuTreeView menus={menuTree} onSelect={setSelectedMenu} />
            </section>

            <section className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
                {selectedMenu ? '✏️ 메뉴 수정' : '➕ 메뉴 등록'}
                {selectedMenu && (
                    <button
                    onClick={() => setSelectedMenu(null)}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                    등록으로 전환
                    </button>
                )}
            </h3>

            <UserMenuForm
            treeData={menuTree}
            initialForm={
                selectedMenu
                    ? {
                        ...selectedMenu,
                        url: selectedMenu.url ?? '', // null → 빈 문자열
                    }
                    : undefined
                }                onSuccess={handleSuccess}
            />
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserMenuManager;

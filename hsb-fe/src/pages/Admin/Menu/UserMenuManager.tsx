import React, { useEffect, useState } from 'react';
import { UserMenuNode } from '../../../types/Admin/UserMenuNode';
import { fetchUserMenuTree, fetchUserMenuOrder } from '../../../services/Admin/userMenuApi';
import UserMenuForm from '../../../components/Admin/Menu/UserMenuForm';
import AdminLayout from '../../../components/Layout/AdminLayout';
import UserMenuTreeView from '../../../components/Admin/Menu/UserMenuTreeView ';

const UserMenuManager: React.FC = () => {
  const [menuTree, setMenuTree] = useState<UserMenuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<UserMenuNode | null>(null); // 수정 대상

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

  const handleMove = async (target: UserMenuNode, direction: 'up' | 'down') => {
    const siblings = findSiblings(menuTree, target.parentId);
  
    const idx = siblings.findIndex(m => m.id === target.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
  
    const swapTarget = siblings[swapIdx];
  
    try {
      // 순서 번호 스왑
      await fetchUserMenuOrder(target.id!, swapTarget.orderSeq!);
      await fetchUserMenuOrder(swapTarget.id!, target.orderSeq!);
  
      // 리로드 
      setLoading(true);
      await loadTree();
      setLoading(false);

    } catch (error) {
      console.error('순서 변경 실패:', error);
    }
  };

  // 형제 노드 필터링
  const findSiblings = (tree: UserMenuNode[], parentId: number | null): UserMenuNode[] => {
    const flat: UserMenuNode[] = [];

    const dfs = (nodes: UserMenuNode[]) => {
      for (const node of nodes) {
        flat.push(node);
        if (node.children?.length) dfs(node.children);
      }
    };
    dfs(tree);
    return flat.filter(n => n.parentId === parentId).sort((a, b) => a.orderSeq! - b.orderSeq!);
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
              <UserMenuTreeView 
                menus={menuTree}
                onSelect={setSelectedMenu}
                onMove={handleMove}
              />
            </section>

            <section className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedMenu ? '✏️ 메뉴 수정' : '➕ 메뉴 등록'}
                </h3>
                {selectedMenu && (
                  <button
                    onClick={() => setSelectedMenu(null)}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    등록으로 전환
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <UserMenuForm
                  treeData={menuTree}
                  initialForm={
                    selectedMenu
                      ? {
                          ...selectedMenu,
                          url: selectedMenu.url ?? '',
                        }
                      : undefined
                  }
                  onSuccess={handleSuccess}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserMenuManager;

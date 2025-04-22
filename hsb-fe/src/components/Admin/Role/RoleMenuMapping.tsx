import React, { useEffect, useState } from 'react';

// 타입 정의
interface RoleGroup {
  id: number;
  name: string;
}

interface AdminMenu {
  id: number;
  name: string;
}

const dummyRoles: RoleGroup[] = [
  { id: 1, name: '시스템 관리자' },
  { id: 2, name: '운영자' },
  { id: 3, name: '콘텐츠 관리자' },
];

const dummyMenus: AdminMenu[] = [
  { id: 101, name: '공지사항 관리' },
  { id: 102, name: '이벤트 관리' },
  
  { id: 103, name: '콘텐츠 업로드' },
  { id: 104, name: '통계 보기' },
];

const dummyRoleMenuMap: Record<number, number[]> = {
  1: [101, 102, 103, 104], // 시스템 관리자: 전체 메뉴
  2: [101, 102],           // 운영자: 일부 메뉴
  3: [103],                // 콘텐츠 관리자
};

const RoleMenuMapping: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);

  useEffect(() => {
    if (selectedRoleId !== null) {
      setSelectedMenuIds(dummyRoleMenuMap[selectedRoleId] || []);
    }
  }, [selectedRoleId]);

  const toggleMenu = (menuId: number) => {
    setSelectedMenuIds(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleSave = () => {
    alert(`✅ [더미] 저장 완료\n\n선택된 메뉴 ID: ${selectedMenuIds.join(', ')}`);
  };

  return (
    <div className="flex p-6 space-x-6">
      {/* 왼쪽: 권한 그룹 리스트 */}
      <div className="w-1/3 border-r pr-4">
        <h2 className="font-bold text-lg mb-4">권한 그룹</h2>
        <ul>
          {dummyRoles.map(role => (
            <li
              key={role.id}
              className={`p-2 cursor-pointer rounded hover:bg-blue-100 ${
                selectedRoleId === role.id ? 'bg-blue-200 font-semibold' : ''
              }`}
              onClick={() => setSelectedRoleId(role.id)}
            >
              {role.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 오른쪽: 메뉴 체크박스 */}
      <div className="w-2/3">
        <h2 className="font-bold text-lg mb-4">메뉴 권한 매핑</h2>
        {selectedRoleId === null ? (
          <p className="text-gray-500">좌측에서 권한 그룹을 먼저 선택해주세요.</p>
        ) : (
          <>
            <ul>
              {dummyMenus.map(menu => (
                <li key={menu.id} className="mb-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMenuIds.includes(menu.id)}
                      onChange={() => toggleMenu(menu.id)}
                      className="mr-2"
                    />
                    {menu.name}
                  </label>
                </li>
              ))}
            </ul>
            <button
              onClick={handleSave}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              저장
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleMenuMapping;

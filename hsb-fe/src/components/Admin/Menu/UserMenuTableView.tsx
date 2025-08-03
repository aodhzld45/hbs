// src/components/Admin/Menu/UserMenuTableView.tsx
import React from 'react';
import { UserMenuNode } from '../../../types/Admin/UserMenuNode';

// 유틸: 트리 → 평탄화
const flattenMenuTree = (
  nodes: UserMenuNode[],
  level = 0,
  result: (UserMenuNode & { label: string })[] = []
): (UserMenuNode & { label: string })[] => {
  nodes.forEach(node => {
    result.push({
      ...node,
      label: `${'—'.repeat(level)} ${node.name}`,
    });
    if (node.children?.length) flattenMenuTree(node.children, level + 1, result);
  });
  return result;
};

interface Props {
  menus: UserMenuNode[];
  onSelect?: (node: UserMenuNode) => void;
  onMove?: (node: UserMenuNode, dir: 'up' | 'down') => void;
}

const UserMenuTableView: React.FC<Props> = ({ menus, onSelect, onMove }) => {
  const flatMenus = flattenMenuTree(menus);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">메뉴명</th>
            <th className="px-4 py-2">URL</th>
            <th className="px-4 py-2">순서</th>
            <th className="px-4 py-2">뎁스</th>
            <th className="px-4 py-2">부모 ID</th>
            <th className="px-4 py-2">상태</th>
            <th className="px-4 py-2">액션</th>
          </tr>
        </thead>
        <tbody>
          {flatMenus.map(menu => {
            const siblings = flatMenus.filter(m => m.parentId === menu.parentId).sort((a, b) => a.orderSeq - b.orderSeq);
            const idx = siblings.findIndex(m => m.id === menu.id);
            const isFirst = idx === 0;
            const isLast = idx === siblings.length - 1;

            return (
              <tr key={menu.id} className="border-t">
                <td className="px-4 py-2">{menu.id}</td>
                <td className="px-4 py-2">{menu.label}</td>
                <td className="px-4 py-2">{menu.url}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1 items-center">
                    <button
                      disabled={isFirst}
                      onClick={() => onMove?.(menu, 'up')}
                      className={`text-gray-500 hover:text-blue-600 ${isFirst && 'opacity-30 cursor-not-allowed'}`}
                    >
                      ▲
                    </button>
                    <span>{menu.orderSeq}</span>
                    <button
                      disabled={isLast}
                      onClick={() => onMove?.(menu, 'down')}
                      className={`text-gray-500 hover:text-blue-600 ${isLast && 'opacity-30 cursor-not-allowed'}`}
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2">{menu.depth}</td>
                <td className="px-4 py-2">{menu.parentId ?? '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${menu.useTf === 'Y' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {menu.useTf === 'Y' ? '사용' : '미사용'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onSelect?.(menu)}
                    className="text-blue-600 hover:underline"
                  >
                    수정
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserMenuTableView;

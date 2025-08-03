import React from 'react';
import { UserMenuNode } from '../../../types/Admin/UserMenuNode';

  type TreeProps = {
      menus: UserMenuNode[];
      onSelect?: (node: UserMenuNode) => void; // 수정 모드 진입용
      onMove: (menu: UserMenuNode, direction: 'up' | 'down') => void; // 순서 변경용
  };

  const renderTree = (
    nodes: UserMenuNode[],
    level = 0,
    onSelect?: (node: UserMenuNode) => void,
    onMove?: (menu: UserMenuNode, direction: 'up' | 'down') => void
  ) => {
    return nodes.map((node) => (
      <div
        key={node.id}
        style={{ marginLeft: `${level * 16}px` }}
        className="py-1 group"
      >
        <div className="flex items-center gap-2">
          <span
            onClick={() => onSelect && onSelect(node)}
            className="cursor-pointer hover:text-blue-600 font-medium"
          >
            • {node.name}
          </span>
  
          {node.url && (
            <span className="text-xs text-gray-500">({node.url})</span>
          )}
  
          {/* 우측 아이콘 영역 */}
          <span className="ml-auto flex gap-2 items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {onMove && (
              <>
                <button onClick={() => onMove(node, 'up')}>▲</button>
                <button onClick={() => onMove(node, 'down')}>▼</button>
              </>
            )}
            {onSelect && (
              <span
                onClick={() => onSelect(node)}
                className="text-blue-400 cursor-pointer hover:underline"
              >
                수정
              </span>
            )}
          </span>
        </div>
  
        {node.children.length > 0 &&
          renderTree(node.children, level + 1, onSelect, onMove)}
      </div>
    ));
  };
    
  const UserMenuTreeView: React.FC<TreeProps> = ({ menus, onSelect, onMove }) => {
    return <div className="space-y-1">{renderTree(menus, 0, onSelect, onMove)}</div>;
  };

export default UserMenuTreeView;
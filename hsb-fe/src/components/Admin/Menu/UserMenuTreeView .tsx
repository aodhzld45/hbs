import React, { useEffect, useState } from 'react';
import { UserMenuNode } from '../../../types/Admin/UserMenuNode';

    type TreeProps = {
        menus: UserMenuNode[];
        onSelect?: (node: UserMenuNode) => void; // 수정 모드 진입용
    };


    const renderTree = (
        nodes: UserMenuNode[],
        level = 0,
        onSelect?: (node: UserMenuNode) => void
      ) => {
        return nodes.map((node) => (
          <div
            key={node.id}
            style={{ marginLeft: `${level * 16}px` }}
            className="py-1 cursor-pointer group"
          >
            <div
              onClick={() => onSelect && onSelect(node)}
              className="font-medium flex items-center gap-2 hover:text-blue-600"
            >
              <span>• {node.name}</span>
              {node.url && (
                <span className="text-xs text-gray-500">({node.url})</span>
              )}
              {onSelect && (
                <span className="ml-auto text-xs text-blue-400 opacity-0 group-hover:opacity-100">
                  수정
                </span>
              )}
            </div>
      
            {/* 자식 재귀 호출 */}
            {node.children.length > 0 &&
              renderTree(node.children, level + 1, onSelect)}
          </div>
        ));
      };


const UserMenuTreeView: React.FC<TreeProps> = ({ menus, onSelect }) => {
    return <div className="space-y-1">{renderTree(menus, 0, onSelect)}</div>;
};

export default UserMenuTreeView;
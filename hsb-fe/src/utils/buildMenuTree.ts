// utils/buildMenuTree.ts

import { AdminMenu } from "../types/Admin/AdminMenu";

export const buildMenuTree = (menus: AdminMenu[]): (AdminMenu & { children?: AdminMenu[] })[] => {
  const map = new Map<number, AdminMenu & { children?: AdminMenu[] }>();
  const roots: (AdminMenu & { children?: AdminMenu[] })[] = [];
  
  menus.forEach((menu) => {
    map.set(menu.id!, { ...menu, children: [] });
  });

  menus.forEach((menu) => {
    if (menu.parentId != null) {
      const parent = map.get(menu.parentId);
      if (parent) {
        parent.children?.push(map.get(menu.id!)!);
      }
    } else {
      roots.push(map.get(menu.id!)!);
    }
  });

  // 정렬 재귀
  const sortRecursive = (nodes: (AdminMenu & { children?: AdminMenu[] })[]) => {
    nodes.sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0));
    nodes.forEach((node) => {
      if (node.children) sortRecursive(node.children);
    });
  };

  sortRecursive(roots);
  return roots;
};

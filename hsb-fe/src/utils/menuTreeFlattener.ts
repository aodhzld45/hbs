// utils/menuTreeFlattener.ts

  export type FlattenedMenuOption = {
      id: number;
      label: string;
    };

  // 최소 구조만 요구하는 TreeNode 타입 정의
  export type TreeNode = {
    id: number;
    name: string;
    children?: TreeNode[];
  };
  
  export const flattenMenuTree = <T extends { id: number; name: string; children?: T[] }>(
    nodes: T[],
    level = 0,
    result: FlattenedMenuOption[] = []
  ): FlattenedMenuOption[] => {
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        label: `${'—'.repeat(level)} ${node.name}`,
      });
  
      if (node.children && node.children.length > 0) {
        flattenMenuTree(node.children, level + 1, result);
      }
    });
  
    return result;
  };
  
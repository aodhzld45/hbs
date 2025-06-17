// utils/menuTreeFlattener.ts

export type FlattenedMenuOption = {
    id: number;
    label: string;
  };
  
  export const flattenMenuTree = (
    nodes: { id: number; name: string; children: any[] }[],
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
  
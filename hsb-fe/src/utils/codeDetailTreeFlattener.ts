// utils/codeDetailTreeFlattener.ts

import { CodeDetailTreeNode } from "./buildCodeDetailTree";

export type FlattenedCodeDetail = CodeDetailTreeNode & {
  label: string;
  level: number;
};

export const flattenCodeDetailTree = (
  nodes: CodeDetailTreeNode[],
  level = 0,
  result: FlattenedCodeDetail[] = []
): FlattenedCodeDetail[] => {
  nodes.forEach((node) => {
    result.push({
      ...node,
      label: `${"—".repeat(level)} ${node.codeNameKo}`,
      level,
    });

    if (node.children && node.children.length > 0) {
      flattenCodeDetailTree(node.children, level + 1, result);
    }
  });

  return result;
};

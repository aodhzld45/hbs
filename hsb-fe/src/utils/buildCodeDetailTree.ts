// utils/buildCodeDetailTree.ts

import { CodeDetail } from "../types/Common/CodeDetail";

export type CodeDetailTreeNode = CodeDetail & {
  children?: CodeDetailTreeNode[];
};

export const buildCodeDetailTree = (
  details: CodeDetail[]
): CodeDetailTreeNode[] => {
  const map = new Map<string, CodeDetailTreeNode>();
  const roots: CodeDetailTreeNode[] = [];

  details.forEach((detail) => {
    map.set(detail.codeId, { ...detail, children: [] });
  });

  details.forEach((detail) => {
    if (detail.parentCodeId) {
      const parent = map.get(detail.parentCodeId);
      if (parent) {
        parent.children?.push(map.get(detail.codeId)!);
      } else {
        // 혹시 부모가 없는 코드도 루트에 올려준다
        roots.push(map.get(detail.codeId)!);
      }
    } else {
      roots.push(map.get(detail.codeId)!);
    }
  });

  // 정렬 재귀
  const sortRecursive = (nodes: CodeDetailTreeNode[]) => {
    nodes.sort((a, b) => (a.orderSeq ?? 0) - (b.orderSeq ?? 0));
    nodes.forEach((node) => {
      if (node.children) sortRecursive(node.children);
    });
  };

  sortRecursive(roots);

  return roots;
};

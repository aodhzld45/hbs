export interface BoardCategoryOption {
  code: string;
  name: string;
  sortSeq?: number;
  useTf?: 'Y' | 'N';
  defaultTf?: 'Y' | 'N';
}

export interface BoardConfigItem {
  id: number;
  boardCode: string;
  boardName: string;
  boardDesc?: string;
  menuPath?: string;
  skinType: string;
  listSize: number;
  sortSeq: number;
  commentTf: 'Y' | 'N';
  fileTf: 'Y' | 'N';
  noticeTf: 'Y' | 'N';
  thumbnailTf: 'Y' | 'N';
  periodTf: 'Y' | 'N';
  secretTf: 'Y' | 'N';
  replyTf: 'Y' | 'N';
  categoryTf: 'Y' | 'N';
  categoryMode: string;
  categoryJson?: string | null;
  editorTf: 'Y' | 'N';
  readRole?: string;
  writeRole?: string;
  updateRole?: string;
  deleteRole?: string;
  useTf: 'Y' | 'N';
  delTf?: 'Y' | 'N';
  regAdm?: string;
  regDate?: string;
  upAdm?: string;
  upDate?: string;
  delAdm?: string;
  delDate?: string;
}

export function parseBoardCategories(categoryJson?: string | null): BoardCategoryOption[] {
  if (!categoryJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(categoryJson) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const result: BoardCategoryOption[] = [];
    parsed.forEach((item) => {
      if (typeof item !== 'object' || item === null) {
        return;
      }
      const record = item as Record<string, unknown>;
      const code = String(record.code ?? '');
      const name = String(record.name ?? '');
      if (!code || !name) {
        return;
      }
      result.push({
        code,
        name,
        sortSeq: typeof record.sortSeq === 'number' ? record.sortSeq : Number(record.sortSeq ?? 0),
        useTf: record.useTf === 'N' ? 'N' : 'Y',
        defaultTf: record.defaultTf === 'Y' ? 'Y' : 'N',
      });
    });

    return result.sort((a, b) => (a.sortSeq ?? 0) - (b.sortSeq ?? 0));
  } catch {
    return [];
  }
}

// src/types/Admin/AdminMenu.ts
export interface AdminMenu {
    id?: number; // 신규 등록 시에는 id가 없을 수 있음
    name: string;
    depth?: number;
    parentId?: number;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    url: string;
    orderSequence: number;
    useTf: 'Y' | 'N';
    delTf: 'Y' | 'N';
  }
  
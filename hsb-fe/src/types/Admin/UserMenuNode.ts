export type UserMenuNode = {
  id: number;
  name: string;
  url: string | null;
  parentId: number | null;
  orderSeq: number;
  description: string;
  useTf: 'Y' | 'N';
  depth: number;
  children: UserMenuNode[];
};
export interface PageSectionItem {
    id: number;
    pageId: number;
    sectionName: string;
    layoutType: LayoutType;
    optionJson: SectionOptionJson;
  
    orderSeq: number;
    useTf: 'Y' | 'N';
    delTf?: 'Y' | 'N';
  
    // regAdm?: string;
    // regDate: string;
    // upAdm?: string;
    // upDate?: string;
    // delAdm?: string;
    // delDate?: string;
  
    files?: PageSectionFileItem[];
}

export interface PageSectionFileItem {
    id: number;
    sectionId: number;
    fileName: string;
    originalFileName: string;
    filePath: string;
    fileSize?: number;
    fileType: string;
    fileExtension: string;
    orderSeq: number;
  
    useTf: 'Y' | 'N';
    delTf: 'Y' | 'N';
  
    // regAdm: string;
    // regDate: string;
    // upAdm: string;
    // upDate: string;
    // delAdm: string;
    // delDate: string;
  }
  

export type LayoutType = 'SINGLE' | 'TWO_COLUMN' | 'GRID';

export interface Block {
  id?: number; // 기존 파일이면 포함
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'BUTTON';
  tag?: string;
  content?: string;
  src?: string;
  label?: string;
  className?: string;
}

// interface Block {
//   id?: number; // 기존 파일이면 포함
//   type: string;
//   tag?: string;
//   content?: string;
//   src?: string | File;
//   label?: string;
//   className?: string;
// }

export interface TailwindOptions {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  alignment?: string;
  paddingY?: string;
}

export interface SectionOptionJson {
  layout: LayoutType;
  tailwindOptions: TailwindOptions;
  left?: Block[];
  right?: Block[];
}

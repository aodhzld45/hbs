export interface CodeParent {
    pcodeNo: number;
    pcode: string;
    pcodeNm: string;
    pcodeMemo?: string;
    pcodeSeqNo: number;
    useTf: 'Y' | 'N';
    delTf: 'Y' | 'N';
    regDate: string;   // ISO 문자열
    upDate: string;    // ISO 문자열
  }
  
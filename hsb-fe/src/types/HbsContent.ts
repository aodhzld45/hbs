// types/HbsContent.ts - ContentFile Table & Entity = HbsContent 매핑.


export type FileType = 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'LINK';
export type ContentType = 'HBS' | 'YOUTUBE' | 'PROMO' | 'MEDIA' | 'CI_BI';


export interface HbsContent {
    fileId: number;             // 파일 식별 아이디
    title: string;              // 파일 제목
    description: string;        // 파일 설명
    content: string;            // 에디터 콘텐츠
    fileUrl: string;            // 파일 경로
    thumbnailUrl: string;       // 썸네일 경로
    extension : string;         // 확장자
    dispSeq : number;           // 순서
    useTF: 'Y' | 'N';           // 사용여부
    delTF: 'Y' | 'N';           // 삭제여부
    regDate: string;            // 등록날짜
    modifyDate?: string;          // 수정날짜 - 선택
    delDate?: string;             // 삭제날짜 - 선택
    fileType: FileType;
    contentType : ContentType
  }
  
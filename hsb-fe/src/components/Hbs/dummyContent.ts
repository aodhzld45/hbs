import { HbsContent } from '../../types/HbsContent';

export const dummyContents: HbsContent[] = [
  {
    fileId: 1,
    title: '효성 HBS 홍보 영상',
    description: '효성의 브랜드를 소개하는 공식 영상입니다.',
    fileUrl: 'https://cdn.hsb.com/videos/hsb_promo_1.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x250.png?text=HBS+Promo+1',
    extension: 'mp4',
    dispSeq: 1,
    useTF: 'Y',
    delTF: 'N',
    regDate: '2025-04-01',
  },
  {
    fileId: 2,
    title: 'CI 소개 영상',
    description: 'CI/BI 브랜드 소개와 활용 가이드 영상입니다.',
    fileUrl: 'https://cdn.hsb.com/videos/ci_intro.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x250.png?text=CI+Intro',
    extension: 'mp4',
    dispSeq: 2,
    useTF: 'Y',
    delTF: 'N',
    regDate: '2025-04-03',
    modifyDate: '2025-04-05',
  },
  {
    fileId: 3,
    title: '사내 행사 영상',
    description: '2024년 사내 행사 영상 스케치입니다.',
    fileUrl: 'https://cdn.hsb.com/videos/internal_event.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x250.png?text=Event+2024',
    extension: 'mp4',
    dispSeq: 3,
    useTF: 'Y',
    delTF: 'N',
    regDate: '2024-12-31',
    delDate: undefined, // 삭제 안 됨
  }
];

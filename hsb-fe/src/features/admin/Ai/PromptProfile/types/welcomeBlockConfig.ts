export type WelcomeBlockType = "text" | "image" | "card";

export type WelcomeBlockBase = {
  id: string;       // uuid
  order: number;    // 정렬용
  type: WelcomeBlockType;
};

export type WelcomeTextBlock = WelcomeBlockBase & {
  type: "text";
  title?: string;
  body: string;
};

export type WelcomeImageBlock = WelcomeBlockBase & {
  type: "image";
  alt?: string;
  caption?: string;

  // 저장된 상태(이미 DB에 반영된 값)
  imagePath?: string;

  // 신규 업로드/교체용(서버 패치용)
  uploadKey?: string;   // hero, card1...
  file?: File;          // 선택된 파일(저장 시 files로 전송)
};

export type WelcomeCardBlock = WelcomeBlockBase & {
  type: "card";
  title: string;
  desc?: string;

  imagePath?: string;   // 기존 저장된 이미지
  uploadKey?: string;   // 새로 교체할 때만
  file?: File;

  buttons: Array<{
    label: string;
    payload: string; // 클릭시 전송 텍스트
  }>;
};

export type WelcomeBlock = WelcomeTextBlock | WelcomeImageBlock | WelcomeCardBlock;

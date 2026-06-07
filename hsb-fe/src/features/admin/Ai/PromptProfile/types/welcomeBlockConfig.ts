export type WelcomeBlockType =
  | "intro"
  | "notice"
  | "categoryGrid"
  | "faqList"
  | "quickReplies"
  | "image"
  | "text"
  | "card";

export type WelcomeBlockBase = {
  id: string;
  order: number;
  type: WelcomeBlockType;
};

export type WelcomeActionItem = {
  label: string;
  payload: string;
  description?: string;
  icon?: string;
};

export type WelcomeIntroBlock = WelcomeBlockBase & {
  type: "intro";
  title: string;
  body: string;
};

export type WelcomeNoticeBlock = WelcomeBlockBase & {
  type: "notice";
  tone: "info" | "warning" | "success" | "danger";
  title?: string;
  body: string;
};

export type WelcomeCategoryGridBlock = WelcomeBlockBase & {
  type: "categoryGrid";
  title: string;
  subtitle?: string;
  items: WelcomeActionItem[];
};

export type WelcomeFaqListBlock = WelcomeBlockBase & {
  type: "faqList";
  title: string;
  subtitle?: string;
  items: WelcomeActionItem[];
};

export type WelcomeQuickRepliesBlock = WelcomeBlockBase & {
  type: "quickReplies";
  title?: string;
  items: WelcomeActionItem[];
};

export type WelcomeImageBlock = WelcomeBlockBase & {
  type: "image";
  alt?: string;
  caption?: string;
  imagePath?: string;
  uploadKey?: string;
  file?: File;
};

export type WelcomeTextBlock = WelcomeBlockBase & {
  type: "text";
  title?: string;
  body: string;
};

export type WelcomeCardBlock = WelcomeBlockBase & {
  type: "card";
  title: string;
  desc?: string;
  imagePath?: string;
  uploadKey?: string;
  file?: File;
  buttons: Array<{
    label: string;
    payload: string;
  }>;
};

export type WelcomeBlock =
  | WelcomeIntroBlock
  | WelcomeNoticeBlock
  | WelcomeCategoryGridBlock
  | WelcomeFaqListBlock
  | WelcomeQuickRepliesBlock
  | WelcomeImageBlock
  | WelcomeTextBlock
  | WelcomeCardBlock;

export type PopupBannerItem = {
    id: number;
    title: string;
    linkUrl: string;
    type: string; // "popup" | "banner"
    file?: File | null;
    filePath?: string;
    originalFileName?: string;
    startDate: string;
    endDate: string;
    orderSeq: number;
    useTf: "Y" | "N";
  };

  export type PopupBannerListResponse = {
    items: PopupBannerItem[];
    totalCount: number;
    totalPages: number;
  };
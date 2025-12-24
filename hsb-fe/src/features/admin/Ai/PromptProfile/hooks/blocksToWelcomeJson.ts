import { WelcomeBlock, WelcomeBlockType } from "../types/welcomeBlockConfig";

export function blocksToWelcomeJson(blocks: WelcomeBlock[]) {
    const items = [...blocks]
      .sort((a, b) => a.order - b.order)
      .map((b) => {
        if (b.type === "text") {
          return {
            id: b.id,
            order: b.order,
            type: "text",
            data: { title: b.title ?? "", body: b.body },
          };
        }
  
        if (b.type === "image") {
          const key = (b.uploadKey ?? "").trim().toLowerCase();
          return {
            id: b.id,
            order: b.order,
            type: "image",
            data: {
              alt: b.alt ?? "",
              caption: b.caption ?? "",
              ...(b.file && key ? { imageRef: `file:${key}` } : {}),
              ...(!b.file && b.imagePath ? { imagePath: b.imagePath } : {}),
            },
          };
        }
  
        // card
        const key = (b.uploadKey ?? "").trim().toLowerCase();
        return {
          id: b.id,
          order: b.order,
          type: "card",
          data: {
            title: b.title,
            desc: b.desc ?? "",
            buttons: b.buttons.map((x) => ({ label: x.label, payload: x.payload })),
            ...(b.file && key ? { imageRef: `file:${key}` } : {}),
            ...(!b.file && b.imagePath ? { imagePath: b.imagePath } : {}),
          },
        };
      });
  
    return JSON.stringify({ version: 1, items }, null, 2);
  }

  export function welcomeJsonToBlocks(json?: string | null): WelcomeBlock[] {
    if (!json?.trim()) return [];
  
    try {
      const root = JSON.parse(json);
      const items = Array.isArray(root?.items) ? root.items : [];
  
      const blocks: WelcomeBlock[] = items.map((it: any, idx: number) => {
        const id = String(it.id ?? crypto.randomUUID());
        const order = Number(it.order ?? idx + 1);
        const type = it.type as WelcomeBlockType;
        const data = it.data ?? {};
  
        if (type === "text") {
          return { id, order, type: "text", title: data.title ?? "", body: data.body ?? "" };
        }
        if (type === "image") {
          return {
            id, order, type: "image",
            alt: data.alt ?? "",
            caption: data.caption ?? "",
            imagePath: data.imagePath ?? undefined,
            uploadKey: "", // 신규 업로드 시 입력
          };
        }
        // card
        return {
          id, order, type: "card",
          title: data.title ?? "",
          desc: data.desc ?? "",
          imagePath: data.imagePath ?? undefined,
          uploadKey: "",
          buttons: Array.isArray(data.buttons) ? data.buttons.map((b: any) => ({
            label: String(b.label ?? ""),
            payload: String(b.payload ?? ""),
          })) : [],
        };
      });
  
      return blocks.sort((a, b) => a.order - b.order);
    } catch {
      return [];
    }
  }

  const renameFileAsKey = (file: File, key: string) => {
    const safe = key.trim().toLowerCase();
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot) : "";
    return new File([file], `${safe}${ext}`, { type: file.type });
  };
  
  export function collectFilesFromBlocks(blocks: WelcomeBlock[]): File[] {
    const out: File[] = [];
  
    for (const b of blocks) {
      if ((b.type === "image" || b.type === "card") && b.file) {
        const key = (b.uploadKey ?? "").trim().toLowerCase();
        if (!key) throw new Error(`업로드 key가 비어 있습니다. (blockId=${b.id})`);
        out.push(renameFileAsKey(b.file, key));
      }
    }
    return out;
  }
  
import type {
  WelcomeActionItem,
  WelcomeBlock,
  WelcomeBlockType,
} from "../types/welcomeBlockConfig";

type AnyObj = Record<string, any>;

const safeStr = (value: any, fallback = "") => (typeof value === "string" ? value : fallback);
const safeNum = (value: any, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const uuid = () => {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
};

const normalizeKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "-");

const extractKeyFromImageRef = (ref?: string) => {
  const value = (ref ?? "").trim();
  if (!value) return "";
  return value.startsWith("file:") ? normalizeKey(value.slice("file:".length)) : "";
};

const normalizeActionItems = (raw: any): WelcomeActionItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      label: safeStr(item?.label),
      payload: safeStr(item?.payload) || safeStr(item?.action?.value) || safeStr(item?.action?.text),
      description: safeStr(item?.description) || safeStr(item?.desc) || undefined,
      icon: safeStr(item?.icon) || undefined,
    }))
    .filter((item) => item.label || item.payload);
};

const blockData = (block: AnyObj) => {
  const data = block?.data;
  if (data && typeof data === "object") {
    return data;
  }
  return block ?? {};
};

export function blocksToWelcomeJson(blocks: WelcomeBlock[]) {
  const items = [...blocks]
    .sort((a, b) => a.order - b.order)
    .map((block: any) => {
      const base = {
        id: block.id ?? uuid(),
        order: safeNum(block.order, 1),
        type: block.type,
        data: {} as AnyObj,
      };

      if (block.type === "intro") {
        base.data = {
          title: safeStr(block.title),
          body: safeStr(block.body),
        };
        return base;
      }

      if (block.type === "notice") {
        base.data = {
          tone: safeStr(block.tone, "info"),
          title: safeStr(block.title),
          body: safeStr(block.body),
        };
        return base;
      }

      if (block.type === "categoryGrid" || block.type === "faqList" || block.type === "quickReplies") {
        base.data = {
          title: safeStr(block.title),
          subtitle: safeStr(block.subtitle),
          items: normalizeActionItems(block.items),
        };
        return base;
      }

      if (block.type === "image") {
        const key = normalizeKey(safeStr(block.uploadKey));
        base.data = {
          alt: safeStr(block.alt),
          caption: safeStr(block.caption),
          ...(block.file && key ? { imageRef: `file:${key}` } : {}),
          ...(!block.file && block.imagePath ? { imagePath: block.imagePath } : {}),
        };
        return base;
      }

      if (block.type === "text") {
        base.type = "intro";
        base.data = {
          title: safeStr(block.title),
          body: safeStr(block.body),
        };
        return base;
      }

      const buttons = normalizeActionItems(block.buttons);
      base.type = "categoryGrid";
      base.data = {
        title: safeStr(block.title),
        subtitle: safeStr(block.desc),
        items: buttons,
      };
      return base;
    });

  return JSON.stringify({ version: 2, items }, null, 2);
}

export function welcomeJsonToBlocks(json?: string | null): WelcomeBlock[] {
  if (!json?.trim()) return [];

  try {
    const root = JSON.parse(json);
    const items = Array.isArray(root) ? root : Array.isArray(root?.items) ? root.items : [];
    const out: WelcomeBlock[] = [];

    items.forEach((item: any, index: number) => {
      const type = safeStr(item?.type) as WelcomeBlockType | "cards";
      const data = blockData(item);
      const id = safeStr(item?.id) || uuid();
      const order = safeNum(item?.order, index + 1);

      if (type === "intro" || type === "text") {
        out.push({
          id,
          order,
          type: "intro",
          title: safeStr(data?.title),
          body: safeStr(data?.body),
        });
        return;
      }

      if (type === "notice") {
        const tone = safeStr(data?.tone, "info");
        out.push({
          id,
          order,
          type: "notice",
          tone: ["info", "warning", "success", "danger"].includes(tone) ? tone as any : "info",
          title: safeStr(data?.title),
          body: safeStr(data?.body),
        });
        return;
      }

      if (type === "categoryGrid" || type === "faqList" || type === "quickReplies") {
        out.push({
          id,
          order,
          type,
          title: safeStr(data?.title),
          subtitle: safeStr(data?.subtitle),
          items: normalizeActionItems(data?.items),
        } as WelcomeBlock);
        return;
      }

      if (type === "image") {
        const imageRef = safeStr(data?.imageRef);
        out.push({
          id,
          order,
          type: "image",
          alt: safeStr(data?.alt),
          caption: safeStr(data?.caption),
          imagePath: safeStr(data?.imagePath) || undefined,
          uploadKey: extractKeyFromImageRef(imageRef),
        });
        return;
      }

      if (type === "cards") {
        const cardItems = Array.isArray(data?.items) ? data.items : [];
        cardItems.forEach((card: any, cardIndex: number) => {
          out.push({
            id: safeStr(card?.id) || `${id}_${cardIndex + 1}`,
            order: order + cardIndex,
            type: "categoryGrid",
            title: safeStr(card?.title),
            subtitle: safeStr(card?.desc),
            items: normalizeActionItems(card?.buttons),
          });
        });
        return;
      }

      out.push({
        id,
        order,
        type: "categoryGrid",
        title: safeStr(data?.title),
        subtitle: safeStr(data?.desc),
        items: normalizeActionItems(data?.buttons),
      });
    });

    return out.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

const renameFileAsKey = (file: File, key: string) => {
  const safe = normalizeKey(key);
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot) : "";
  return new File([file], `${safe}${ext}`, { type: file.type });
};

export function collectFilesFromBlocks(blocks: WelcomeBlock[]): File[] {
  const out: File[] = [];
  const used = new Set<string>();

  for (const block of blocks as any[]) {
    if ((block.type === "image" || block.type === "card") && block.file) {
      const key = normalizeKey(safeStr(block.uploadKey));
      if (!key) {
        throw new Error(`업로드 key가 비어 있습니다. (blockId=${block.id})`);
      }

      const renamed = renameFileAsKey(block.file, key);
      if (used.has(key)) {
        for (let i = out.length - 1; i >= 0; i -= 1) {
          if (out[i].name.startsWith(`${key}.`) || out[i].name === renamed.name) {
            out.splice(i, 1);
          }
        }
      }

      used.add(key);
      out.push(renamed);
    }
  }

  return out;
}

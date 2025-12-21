import { WelcomeBlock, WelcomeBlockType } from "../types/welcomeBlockConfig";

type AnyObj = Record<string, any>;

const safeStr = (v: any, d = "") => (typeof v === "string" ? v : d);
const safeNum = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const uuid = () => {
  try {
    // eslint-disable-next-line no-undef
    return crypto?.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
};

const normalizeKey = (s: string) => (s ?? "").trim().toLowerCase().replace(/\s+/g, "-");

const extractKeyFromImageRef = (ref?: string) => {
  const r = (ref ?? "").trim();
  if (!r) return "";
  // file:hero 형태
  if (r.startsWith("file:")) return normalizeKey(r.slice("file:".length));
  return "";
};

/**
 * blocks -> welcomeBlocksJson(JSON string)
 * - image/card: file + uploadKey 있으면 imageRef(file:key)로 저장
 * - file이 없으면 기존 imagePath 유지
 */
export function blocksToWelcomeJson(blocks: WelcomeBlock[]) {
  const items = [...blocks]
    .sort((a, b) => a.order - b.order)
    .map((b: any) => {
      const base = {
        id: b.id ?? uuid(),
        order: safeNum(b.order, 1),
        type: b.type,
        data: {} as AnyObj,
      };

      if (b.type === "text") {
        base.type = "text";
        base.data = {
          title: safeStr(b.title),
          body: safeStr(b.body),
        };
        return base;
      }

      if (b.type === "image") {
        base.type = "image";
        const key = normalizeKey(safeStr(b.uploadKey));
        base.data = {
          alt: safeStr(b.alt),
          caption: safeStr(b.caption),
          ...(b.file && key ? { imageRef: `file:${key}` } : {}),
          ...(!b.file && b.imagePath ? { imagePath: b.imagePath } : {}),
        };
        return base;
      }

      // card
      base.type = "card";
      const key = normalizeKey(safeStr(b.uploadKey));

      const buttons = Array.isArray(b.buttons)
        ? b.buttons.map((x: any) => ({
            label: safeStr(x.label),
            payload: safeStr(x.payload),
          }))
        : [];

      base.data = {
        title: safeStr(b.title),
        desc: safeStr(b.desc),
        buttons,
        ...(b.file && key ? { imageRef: `file:${key}` } : {}),
        ...(!b.file && b.imagePath ? { imagePath: b.imagePath } : {}),
      };
      return base;
    });

  return JSON.stringify({ version: 1, items }, null, 2);
}

/**
 * welcomeBlocksJson -> blocks
 * - type "cards"도 허용: data.items 배열을 여러 "card" 블록으로 펼침
 * - 버튼도 payload 방식 / action.value 방식 둘 다 지원
 */
export function welcomeJsonToBlocks(json?: string | null): WelcomeBlock[] {
  if (!json?.trim()) return [];

  try {
    const root = JSON.parse(json);
    const items = Array.isArray(root) ? root : Array.isArray(root?.items) ? root.items : [];

    const out: WelcomeBlock[] = [];

    items.forEach((it: any, idx: number) => {
      const typeRaw = safeStr(it?.type) as WelcomeBlockType | "cards";
      const data = (it?.data ?? {}) as AnyObj;

      const baseId = safeStr(it?.id) || uuid();
      const baseOrder = safeNum(it?.order, idx + 1);

      // legacy/예시: type="cards" (carousel 형태) -> 여러 card 블록으로 펼침
      if (typeRaw === "cards") {
        const cardItems = Array.isArray(data?.items) ? data.items : [];
        cardItems.forEach((c: any, j: number) => {
          const cid = c?.id ? String(c.id) : `${baseId}_${j + 1}`;
          const cButtonsRaw = Array.isArray(c?.buttons) ? c.buttons : [];

          const buttons = cButtonsRaw.map((b: any) => {
            const label = safeStr(b?.label);
            // payload 우선, 없으면 action.value
            const payload =
              safeStr(b?.payload) ||
              safeStr(b?.action?.value) ||
              safeStr(b?.action?.text) ||
              "";
            return { label, payload };
          });

          const imageRef = safeStr(c?.imageRef);
          const uploadKeyFromRef = extractKeyFromImageRef(imageRef);

          out.push({
            id: cid,
            order: baseOrder + j, // 펼칠 때 순서 유지
            type: "card",
            title: safeStr(c?.title),
            desc: safeStr(c?.desc),
            imagePath: safeStr(c?.imagePath) || undefined,
            uploadKey: uploadKeyFromRef || "",
            buttons,
          } as any);
        });
        return;
      }

      if (typeRaw === "text") {
        out.push({
          id: baseId,
          order: baseOrder,
          type: "text",
          title: safeStr(data?.title),
          body: safeStr(data?.body),
        } as any);
        return;
      }

      if (typeRaw === "image") {
        const imageRef = safeStr(data?.imageRef);
        const uploadKeyFromRef = extractKeyFromImageRef(imageRef);

        out.push({
          id: baseId,
          order: baseOrder,
          type: "image",
          alt: safeStr(data?.alt),
          caption: safeStr(data?.caption),
          imagePath: safeStr(data?.imagePath) || undefined,
          uploadKey: uploadKeyFromRef || "",
        } as any);
        return;
      }

      // card
      const buttonsRaw = Array.isArray(data?.buttons) ? data.buttons : [];
      const buttons = buttonsRaw.map((b: any) => {
        const label = safeStr(b?.label);
        const payload =
          safeStr(b?.payload) ||
          safeStr(b?.action?.value) ||
          safeStr(b?.action?.text) ||
          "";
        return { label, payload };
      });

      const imageRef = safeStr(data?.imageRef);
      const uploadKeyFromRef = extractKeyFromImageRef(imageRef);

      out.push({
        id: baseId,
        order: baseOrder,
        type: "card",
        title: safeStr(data?.title),
        desc: safeStr(data?.desc),
        imagePath: safeStr(data?.imagePath) || undefined,
        uploadKey: uploadKeyFromRef || "",
        buttons,
      } as any);
    });

    return out.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

/** 파일명을 key.ext로 리네임(File 재생성) */
const renameFileAsKey = (file: File, key: string) => {
  const safe = normalizeKey(key);
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot) : "";
  return new File([file], `${safe}${ext}`, { type: file.type });
};

/**
 * blocks에서 업로드 파일 수집 (A안: fileName=key.ext)
 * - uploadKey가 없으면 imageRef(file:key)에서 key 추출 시도
 * - key 중복은 마지막이 wins(서버 saved map도 마지막으로 덮일 가능성)
 */
export function collectFilesFromBlocks(blocks: WelcomeBlock[]): File[] {
  const out: File[] = [];
  const used = new Set<string>();

  for (const b of blocks as any[]) {
    if ((b.type === "image" || b.type === "card") && b.file) {
      const key = normalizeKey(safeStr(b.uploadKey));
      if (!key) {
        throw new Error(`업로드 key가 비어 있습니다. (blockId=${b.id})`);
      }

      const renamed = renameFileAsKey(b.file, key);

      // 같은 key가 여러 개면 마지막 것을 사용(중복 방지)
      if (used.has(key)) {
        // 기존 out에서 같은 key 파일 제거
        for (let i = out.length - 1; i >= 0; i--) {
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

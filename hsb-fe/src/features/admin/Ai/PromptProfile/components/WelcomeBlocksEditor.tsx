import React from "react";
import type { KbDocumentResponse } from "../../KbDocument/types/KbDocumentConfig";
import type {
  WelcomeActionItem,
  WelcomeBlock,
  WelcomeBlockType,
} from "../types/welcomeBlockConfig";

type Props = {
  blocks: WelcomeBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<WelcomeBlock[]>>;
  selectedKbDocs?: KbDocumentResponse[];
};

type ManagedBlockType = Extract<
  WelcomeBlockType,
  "intro" | "notice" | "categoryGrid" | "faqList" | "quickReplies" | "image"
>;

const BLOCK_META: Record<ManagedBlockType, { label: string; desc: string; badge: string }> = {
  intro: {
    label: "소개/서비스 범위",
    desc: "챗봇이 무엇을 도와주는지 첫 화면에서 설명합니다.",
    badge: "bg-slate-100 text-slate-700",
  },
  notice: {
    label: "안내 문구",
    desc: "개인정보, 운영 시간, 답변 한계 같은 주의사항을 보여줍니다.",
    badge: "bg-amber-100 text-amber-700",
  },
  categoryGrid: {
    label: "카테고리 카드",
    desc: "고려대 챗봇처럼 주요 업무 카테고리를 카드 그리드로 보여줍니다.",
    badge: "bg-blue-100 text-blue-700",
  },
  faqList: {
    label: "FAQ/TOP 질문",
    desc: "자주 묻는 질문을 목록으로 보여주고 클릭 시 질문을 전송합니다.",
    badge: "bg-violet-100 text-violet-700",
  },
  quickReplies: {
    label: "빠른 질문 버튼",
    desc: "짧은 추천 질문 버튼을 메시지 입력 전 단계에 배치합니다.",
    badge: "bg-emerald-100 text-emerald-700",
  },
  image: {
    label: "이미지",
    desc: "웰컴 영역에 배너나 캐릭터 이미지를 추가합니다.",
    badge: "bg-green-100 text-green-700",
  },
};

const TONE_OPTIONS = [
  { value: "info", label: "정보" },
  { value: "warning", label: "주의" },
  { value: "success", label: "성공" },
  { value: "danger", label: "위험" },
] as const;

const normalizeKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "-");

const createBlockId = () =>
  globalThis.crypto?.randomUUID?.() ?? `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const resequence = (items: WelcomeBlock[]) =>
  [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index + 1 } as WelcomeBlock));

const parseStringArray = (raw?: string | null) => {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const uniqueStrings = (items: string[]) =>
  items.filter((value, index) => items.indexOf(value) === index);

const createActionItem = (): WelcomeActionItem => ({
  label: "",
  payload: "",
  description: "",
  icon: "",
});

const createBlock = (type: ManagedBlockType, order: number): WelcomeBlock => {
  const id = createBlockId();
  if (type === "intro") {
    return { id, order, type, title: "", body: "" };
  }
  if (type === "notice") {
    return { id, order, type, tone: "info", title: "", body: "" };
  }
  if (type === "categoryGrid") {
    return { id, order, type, title: "", subtitle: "", items: [] };
  }
  if (type === "faqList") {
    return { id, order, type, title: "자주 묻는 질문", subtitle: "", items: [] };
  }
  if (type === "quickReplies") {
    return { id, order, type, title: "추천 질문", items: [] };
  }
  return {
    id,
    order,
    type,
    alt: "",
    caption: "",
    uploadKey: "",
    imagePath: undefined,
    file: undefined,
  };
};

const blockTitle = (block: WelcomeBlock) => {
  if (block.type === "intro" || block.type === "categoryGrid" || block.type === "faqList") {
    return block.title || BLOCK_META[block.type].label;
  }
  if (block.type === "quickReplies") {
    return block.title || BLOCK_META.quickReplies.label;
  }
  if (block.type === "notice") {
    return block.title || BLOCK_META.notice.label;
  }
  if (block.type === "image") {
    return block.caption || BLOCK_META.image.label;
  }
  if (block.type === "text") {
    return block.title || "Legacy text";
  }
  return block.title || "Legacy card";
};

const isActionBlock = (
  block: WelcomeBlock,
): block is Extract<WelcomeBlock, { type: "categoryGrid" | "faqList" | "quickReplies" }> =>
  block.type === "categoryGrid" || block.type === "faqList" || block.type === "quickReplies";

const textInputClass = "w-full rounded border border-gray-300 px-2 py-1 text-xs";
const textAreaClass = "w-full rounded border border-gray-300 px-2 py-1 text-xs min-h-[80px]";
const smallButtonClass = "rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";

export function WelcomeBlocksEditor({
  blocks,
  setBlocks,
  selectedKbDocs = [],
}: Props) {
  const [replaceExisting, setReplaceExisting] = React.useState(true);
  const [includeKeywords, setIncludeKeywords] = React.useState(true);
  const previewUrlRef = React.useRef<Record<string, string>>({});
  const [, forcePreviewRefresh] = React.useState(0);

  React.useEffect(() => {
    const activeIds = new Set<string>();

    blocks.forEach((block) => {
      if (block.type === "image" && block.file) {
        activeIds.add(block.id);
        if (!previewUrlRef.current[block.id]) {
          previewUrlRef.current[block.id] = URL.createObjectURL(block.file);
        }
      }
    });

    Object.keys(previewUrlRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        URL.revokeObjectURL(previewUrlRef.current[id]);
        delete previewUrlRef.current[id];
      }
    });

    forcePreviewRefresh((value) => value + 1);
  }, [blocks]);

  React.useEffect(() => {
    return () => {
      Object.values(previewUrlRef.current).forEach((url) => URL.revokeObjectURL(url));
      previewUrlRef.current = {};
    };
  }, []);

  const patchBlock = (id: string, patch: Partial<WelcomeBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? ({ ...block, ...patch } as WelcomeBlock) : block)),
    );
  };

  const addBlock = (type: ManagedBlockType) => {
    setBlocks((prev) => resequence([...prev, createBlock(type, prev.length + 1)]));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => resequence(prev.filter((block) => block.id !== id)));
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= sorted.length) return prev;
      const next = [...sorted];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return resequence(next);
    });
  };

  const addActionItem = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (!isActionBlock(block) || block.id !== blockId) return block;
        return { ...block, items: [...block.items, createActionItem()] } as WelcomeBlock;
      }),
    );
  };

  const updateActionItem = (blockId: string, index: number, patch: Partial<WelcomeActionItem>) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (!isActionBlock(block) || block.id !== blockId) return block;
        return {
          ...block,
          items: block.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        } as WelcomeBlock;
      }),
    );
  };

  const removeActionItem = (blockId: string, index: number) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (!isActionBlock(block) || block.id !== blockId) return block;
        return { ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) } as WelcomeBlock;
      }),
    );
  };

  const moveActionItem = (blockId: string, index: number, direction: -1 | 1) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (!isActionBlock(block) || block.id !== blockId) return block;
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= block.items.length) return block;
        const nextItems = [...block.items];
        [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
        return { ...block, items: nextItems } as WelcomeBlock;
      }),
    );
  };

  const generateBlocksFromSelectedDocs = () => {
    const categoryItems: WelcomeActionItem[] = [];
    const faqItems: WelcomeActionItem[] = [];
    const keywordLines: string[] = [];

    selectedKbDocs.forEach((doc) => {
      const title = doc.welcomeTitle?.trim() || doc.title?.trim() || doc.originalFileName?.trim();
      const intro = doc.welcomeIntro?.trim() || doc.indexSummary?.trim() || "";
      const questions = uniqueStrings(parseStringArray(doc.welcomeQuestionsJson));
      const keywords = uniqueStrings(parseStringArray(doc.welcomeKeywordsJson));

      if (title || intro) {
        categoryItems.push({
          label: title || "추천 문서",
          payload: questions[0] || `${title || doc.title}에 대해 알려줘`,
          description: intro.length > 120 ? `${intro.slice(0, 120)}...` : intro,
          icon: "book-open",
        });
      }

      questions.forEach((question) => {
        faqItems.push({ label: question, payload: question });
      });

      if (includeKeywords && keywords.length > 0) {
        keywordLines.push(`${title || doc.title}: ${keywords.join(", ")}`);
      }
    });

    const generated: WelcomeBlock[] = [];

    if (categoryItems.length > 0) {
      generated.push({
        id: createBlockId(),
        order: 1,
        type: "categoryGrid",
        title: "무엇을 도와드릴까요?",
        subtitle: includeKeywords && keywordLines.length > 0 ? `추천 키워드: ${keywordLines.join(" / ")}` : "",
        items: categoryItems,
      });
    }

    if (faqItems.length > 0) {
      generated.push({
        id: createBlockId(),
        order: generated.length + 1,
        type: "faqList",
        title: "자주 묻는 질문",
        subtitle: "선택한 KB 문서의 추천 질문입니다.",
        items: uniqueStrings(faqItems.map((item) => item.payload)).map((question) => ({
          label: question,
          payload: question,
        })),
      });
    }

    if (generated.length === 0) return;
    setBlocks((prev) => resequence(replaceExisting ? generated : [...prev, ...generated]));
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">웰컴 콘텐츠</h3>
        <p className="mt-1 text-xs text-gray-500">
          PromptProfile의 welcomeBlocksJson이 챗봇 첫 화면 콘텐츠의 공식 기준입니다. WidgetConfig는 이후 이 콘텐츠를 어떤 레이아웃으로 보여줄지만 결정합니다.
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-blue-900">선택 KB 문서 기반 자동 생성</div>
            <div className="mt-1 text-xs text-blue-700">
              선택된 KB 문서의 welcome title, intro, questions, keywords를 카테고리 카드와 FAQ 목록으로 변환합니다.
            </div>
          </div>
          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={generateBlocksFromSelectedDocs}
            disabled={selectedKbDocs.length === 0}
          >
            자동 생성
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-blue-800">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={replaceExisting} onChange={(event) => setReplaceExisting(event.target.checked)} />
            기존 웰컴 콘텐츠 덮어쓰기
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={includeKeywords} onChange={(event) => setIncludeKeywords(event.target.checked)} />
            키워드를 설명에 포함
          </label>
          <span>선택 문서 {selectedKbDocs.length}건</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(BLOCK_META) as ManagedBlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => addBlock(type)}
            title={BLOCK_META[type].desc}
          >
            + {BLOCK_META[type].label}
          </button>
        ))}
      </div>

      {sortedBlocks.length === 0 && (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-500">
          웰컴 콘텐츠가 없습니다. 소개/카테고리/FAQ 블록을 추가하거나 KB 문서 기반 자동 생성을 사용하세요.
        </div>
      )}

      <div className="space-y-3">
        {sortedBlocks.map((block, index) => {
          const meta = BLOCK_META[(block.type === "text" ? "intro" : block.type === "card" ? "categoryGrid" : block.type) as ManagedBlockType];
          return (
            <div key={block.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                  <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}>{meta.label}</span>
                  <span className="text-xs font-semibold text-gray-800">{blockTitle(block)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" className={smallButtonClass} onClick={() => moveBlock(block.id, -1)} disabled={index === 0}>위</button>
                  <button type="button" className={smallButtonClass} onClick={() => moveBlock(block.id, 1)} disabled={index === sortedBlocks.length - 1}>아래</button>
                  <button type="button" className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => removeBlock(block.id)}>삭제</button>
                </div>
              </div>

              {block.type === "intro" && (
                <div className="space-y-2">
                  <input className={textInputClass} placeholder="제목" value={block.title} onChange={(event) => patchBlock(block.id, { title: event.target.value } as Partial<WelcomeBlock>)} />
                  <textarea className={textAreaClass} placeholder="서비스 범위 설명" value={block.body} onChange={(event) => patchBlock(block.id, { body: event.target.value } as Partial<WelcomeBlock>)} />
                </div>
              )}

              {block.type === "notice" && (
                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-[160px_1fr]">
                    <select className={textInputClass} value={block.tone} onChange={(event) => patchBlock(block.id, { tone: event.target.value as any } as Partial<WelcomeBlock>)}>
                      {TONE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <input className={textInputClass} placeholder="제목(선택)" value={block.title ?? ""} onChange={(event) => patchBlock(block.id, { title: event.target.value } as Partial<WelcomeBlock>)} />
                  </div>
                  <textarea className={textAreaClass} placeholder="안내 문구" value={block.body} onChange={(event) => patchBlock(block.id, { body: event.target.value } as Partial<WelcomeBlock>)} />
                </div>
              )}

              {isActionBlock(block) && (
                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-2">
                    <input className={textInputClass} placeholder="블록 제목" value={block.title ?? ""} onChange={(event) => patchBlock(block.id, { title: event.target.value } as Partial<WelcomeBlock>)} />
                    {block.type !== "quickReplies" && (
                      <input className={textInputClass} placeholder="보조 설명(선택)" value={block.subtitle ?? ""} onChange={(event) => patchBlock(block.id, { subtitle: event.target.value } as Partial<WelcomeBlock>)} />
                    )}
                  </div>

                  <div className="rounded border border-gray-200 bg-white p-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">클릭 항목</span>
                      <button type="button" className={smallButtonClass} onClick={() => addActionItem(block.id)}>+ 항목 추가</button>
                    </div>
                    {block.items.length === 0 && (
                      <div className="rounded border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-400">
                        항목을 추가하면 SDK에서 카드, FAQ, 빠른 질문 버튼으로 렌더링됩니다.
                      </div>
                    )}
                    <div className="space-y-2">
                      {block.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="rounded border border-gray-100 bg-gray-50 p-2">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500">#{itemIndex + 1}</span>
                            <div className="flex gap-1">
                              <button type="button" className={smallButtonClass} onClick={() => moveActionItem(block.id, itemIndex, -1)} disabled={itemIndex === 0}>위</button>
                              <button type="button" className={smallButtonClass} onClick={() => moveActionItem(block.id, itemIndex, 1)} disabled={itemIndex === block.items.length - 1}>아래</button>
                              <button type="button" className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => removeActionItem(block.id, itemIndex)}>삭제</button>
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <input className={textInputClass} placeholder="라벨" value={item.label} onChange={(event) => updateActionItem(block.id, itemIndex, { label: event.target.value })} />
                            <input className={textInputClass} placeholder="클릭 시 전송할 질문" value={item.payload} onChange={(event) => updateActionItem(block.id, itemIndex, { payload: event.target.value })} />
                            {block.type === "categoryGrid" && (
                              <>
                                <input className={textInputClass} placeholder="설명(선택)" value={item.description ?? ""} onChange={(event) => updateActionItem(block.id, itemIndex, { description: event.target.value })} />
                                <input className={textInputClass} placeholder="아이콘 키(선택, 예: book-open)" value={item.icon ?? ""} onChange={(event) => updateActionItem(block.id, itemIndex, { icon: event.target.value })} />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {block.type === "image" && (
                <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                  <div>
                    {previewUrlRef.current[block.id] || block.imagePath ? (
                      <img src={previewUrlRef.current[block.id] || block.imagePath} alt="preview" className="h-20 w-28 rounded border object-cover" />
                    ) : (
                      <div className="flex h-20 w-28 items-center justify-center rounded border bg-white text-xs text-gray-400">미리보기</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="grid gap-2 md:grid-cols-2">
                      <input className={textInputClass} placeholder="uploadKey (예: hero)" value={block.uploadKey ?? ""} onChange={(event) => patchBlock(block.id, { uploadKey: normalizeKey(event.target.value) } as Partial<WelcomeBlock>)} />
                      <label className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-1 text-center text-xs hover:bg-gray-50">
                        이미지 파일 선택
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.currentTarget.value = "";
                            if (!file) return;
                            patchBlock(block.id, { file } as Partial<WelcomeBlock>);
                          }}
                        />
                      </label>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <input className={textInputClass} placeholder="alt(선택)" value={block.alt ?? ""} onChange={(event) => patchBlock(block.id, { alt: event.target.value } as Partial<WelcomeBlock>)} />
                      <input className={textInputClass} placeholder="caption(선택)" value={block.caption ?? ""} onChange={(event) => patchBlock(block.id, { caption: event.target.value } as Partial<WelcomeBlock>)} />
                    </div>
                    <button type="button" className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => patchBlock(block.id, { file: undefined, imagePath: undefined } as Partial<WelcomeBlock>)}>
                      이미지 제거
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

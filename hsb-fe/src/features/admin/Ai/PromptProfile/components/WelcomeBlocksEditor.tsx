import React from "react";
import type { KbDocumentResponse } from "../../KbDocument/types/KbDocumentConfig";
import type { WelcomeBlock, WelcomeBlockType } from "../types/welcomeBlockConfig";

type Props = {
  blocks: WelcomeBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<WelcomeBlock[]>>;
  selectedKbDocs?: KbDocumentResponse[];
};

const badge = (t: WelcomeBlockType) => {
  if (t === "text") return "텍스트";
  if (t === "image") return "이미지";
  return "카드";
};

const typeBadgeClass = (t: WelcomeBlockType) => {
  if (t === "text") return "bg-gray-100 text-gray-700";
  if (t === "image") return "bg-green-100 text-green-700";
  return "bg-blue-100 text-blue-700";
};

const normalizeKey = (s: string) =>
  (s ?? "").trim().toLowerCase().replace(/\s+/g, "-");

const resequence = (blocks: WelcomeBlock[]) =>
  [...blocks]
    .sort((a, b) => a.order - b.order)
    .map((b, i) => ({ ...b, order: i + 1 }));

const createBlockId = () =>
  (globalThis.crypto as any)?.randomUUID?.() ??
  `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const parseStringArray = (raw?: string | null) => {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

const uniqueStrings = (items: string[]) =>
  items.filter((value, index) => items.indexOf(value) === index);

export function WelcomeBlocksEditor({
  blocks,
  setBlocks,
  selectedKbDocs = [],
}: Props) {
  const [replaceExisting, setReplaceExisting] = React.useState(true);
  const [includeKeywords, setIncludeKeywords] = React.useState(true);

  const addBlock = (type: WelcomeBlockType) => {
    const id = createBlockId();
    const order = blocks.length + 1;

    const block: WelcomeBlock =
      type === "text"
        ? { id, order, type: "text", title: "", body: "" }
        : type === "image"
          ? {
              id,
              order,
              type: "image",
              alt: "",
              caption: "",
              uploadKey: "",
              imagePath: undefined,
              file: undefined,
            }
          : {
              id,
              order,
              type: "card",
              title: "",
              desc: "",
              uploadKey: "",
              imagePath: undefined,
              file: undefined,
              buttons: [],
            };

    setBlocks((prev) => resequence([...prev, block]));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => resequence(prev.filter((b) => b.id !== id)));
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.id === id);
      const nextIdx = idx + dir;
      if (idx < 0 || nextIdx < 0 || nextIdx >= sorted.length) return prev;

      const a = sorted[idx];
      const b = sorted[nextIdx];
      const tmp = a.order;
      a.order = b.order;
      b.order = tmp;

      return resequence(sorted);
    });
  };

  const patchBlock = (id: string, patch: Partial<WelcomeBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as WelcomeBlock) : b)),
    );
  };

  const addCardButton = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== "card") return b;
        return {
          ...b,
          buttons: [...(b.buttons ?? []), { label: "", payload: "" }],
        };
      }),
    );
  };

  const updateCardButton = (
    blockId: string,
    idx: number,
    patch: { label?: string; payload?: string },
  ) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== "card") return b;
        return {
          ...b,
          buttons: (b.buttons ?? []).map((button, buttonIndex) =>
            buttonIndex === idx ? { ...button, ...patch } : button,
          ),
        };
      }),
    );
  };

  const removeCardButton = (blockId: string, idx: number) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== "card") return b;
        return {
          ...b,
          buttons: (b.buttons ?? []).filter((_, buttonIndex) => buttonIndex !== idx),
        };
      }),
    );
  };

  const moveCardButton = (blockId: string, idx: number, dir: -1 | 1) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== "card") return b;

        const buttons = [...(b.buttons ?? [])];
        const nextIdx = idx + dir;
        if (nextIdx < 0 || nextIdx >= buttons.length) return b;

        const tmp = buttons[idx];
        buttons[idx] = buttons[nextIdx];
        buttons[nextIdx] = tmp;

        return { ...b, buttons };
      }),
    );
  };

  const renderPreview = (b: WelcomeBlock) => {
    if ((b.type === "image" || b.type === "card") && b.file) {
      const url = URL.createObjectURL(b.file);
      return (
        <img
          src={url}
          alt="preview"
          className="w-28 h-20 object-cover border rounded"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }

    if ((b.type === "image" || b.type === "card") && b.imagePath) {
      return (
        <img
          src={b.imagePath}
          alt="preview"
          className="w-28 h-20 object-cover border rounded"
        />
      );
    }

    return (
      <div className="w-28 h-20 border rounded bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        미리보기
      </div>
    );
  };

  const generateBlocksFromSelectedDocs = () => {
    const generated: WelcomeBlock[] = selectedKbDocs.flatMap((doc) => {
      const title = doc.welcomeTitle?.trim() || doc.title?.trim() || "";
      const intro = doc.welcomeIntro?.trim() || "";
      const questions = uniqueStrings(parseStringArray(doc.welcomeQuestionsJson));
      const keywords = uniqueStrings(parseStringArray(doc.welcomeKeywordsJson));

      const descParts = [intro];
      if (includeKeywords && keywords.length > 0) {
        descParts.push(`추천 키워드: ${keywords.join(", ")}`);
      }

      const desc = descParts.filter(Boolean).join("\n\n").trim();
      if (!title && !desc && questions.length === 0) {
        return [];
      }

      return [
        {
          id: createBlockId(),
          order: 0,
          type: "card",
          title: title || "추천 문서",
          desc: desc || undefined,
          buttons: questions.map((question) => ({
            label: question,
            payload: question,
          })),
        },
      ];
    });

    if (generated.length === 0) return;

    setBlocks((prev) =>
      resequence(replaceExisting ? generated : [...prev, ...generated]),
    );
  };

  return (
    <div className="mt-4 border rounded p-3">
      <div className="mb-3 rounded border bg-gray-50 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-sm text-gray-800">
              선택 KB 문서 기반 자동 생성
            </div>
            <div className="mt-1 text-xs text-gray-500">
              선택된 문서의 welcome title, intro, questions, keywords를 조합해
              웰컴 카드 블록을 만듭니다.
            </div>
          </div>

          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={generateBlocksFromSelectedDocs}
            disabled={selectedKbDocs.length === 0}
          >
            자동 생성
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded"
            />
            기존 웰컴 블록 덮어쓰기
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeKeywords}
              onChange={(e) => setIncludeKeywords(e.target.checked)}
              className="rounded"
            />
            키워드를 설명에 포함
          </label>
        </div>

        <div className="mt-2 text-[11px] text-gray-500">
          선택 문서 {selectedKbDocs.length}건
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-sm">웰컴 블록</div>
          <div className="text-xs text-gray-500 mt-1">
            텍스트, 이미지, 카드 블록으로 구성합니다. 이미지 파일은{" "}
            <b>uploadKey</b>로 매핑되고 서버에서 <b>file:key</b> 경로로
            치환됩니다.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            onClick={() => addBlock("text")}
          >
            + 텍스트
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            onClick={() => addBlock("image")}
          >
            + 이미지
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            onClick={() => addBlock("card")}
          >
            + 카드
          </button>
        </div>
      </div>

      {blocks.length === 0 && (
        <div className="text-xs text-gray-500 border rounded p-3 bg-gray-50">
          상단 자동 생성이나 수동 추가 버튼으로 웰컴 블록을 구성해 주세요.
        </div>
      )}

      <div className="space-y-2">
        {blocks
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((b, idx) => (
            <div key={b.id} className="border rounded p-2 bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    #{idx + 1} / order: {b.order}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded ${typeBadgeClass(b.type)}`}
                  >
                    {badge(b.type)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="px-1 text-xs border rounded"
                    onClick={() => moveBlock(b.id, -1)}
                    disabled={idx === 0}
                    title="위로"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="px-1 text-xs border rounded"
                    onClick={() => moveBlock(b.id, 1)}
                    disabled={idx === blocks.length - 1}
                    title="아래로"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="px-2 text-xs border rounded text-red-500 hover:bg-red-50"
                    onClick={() => removeBlock(b.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>

              {b.type === "text" && (
                <div className="space-y-2">
                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="제목(옵션)"
                    value={b.title ?? ""}
                    onChange={(e) =>
                      patchBlock(b.id, { title: e.target.value } as Partial<WelcomeBlock>)
                    }
                  />
                  <textarea
                    className="w-full border rounded px-2 py-1 text-xs min-h-[90px]"
                    placeholder="본문 텍스트"
                    value={b.body ?? ""}
                    onChange={(e) =>
                      patchBlock(b.id, { body: e.target.value } as Partial<WelcomeBlock>)
                    }
                  />
                </div>
              )}

              {b.type === "image" && (
                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
                  <div className="flex flex-col gap-2">{renderPreview(b)}</div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className="w-full border rounded px-2 py-1 text-xs"
                        placeholder="uploadKey (예: hero)"
                        value={b.uploadKey ?? ""}
                        onChange={(e) =>
                          patchBlock(
                            b.id,
                            { uploadKey: normalizeKey(e.target.value) } as Partial<WelcomeBlock>,
                          )
                        }
                      />
                      <label className="w-full px-3 py-1 text-xs border rounded cursor-pointer hover:bg-gray-50 text-center">
                        이미지 파일 선택
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.currentTarget.value = "";
                            if (!file) return;
                            patchBlock(b.id, { file } as Partial<WelcomeBlock>);
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className="w-full border rounded px-2 py-1 text-xs"
                        placeholder="alt(옵션)"
                        value={b.alt ?? ""}
                        onChange={(e) =>
                          patchBlock(b.id, { alt: e.target.value } as Partial<WelcomeBlock>)
                        }
                      />
                      <input
                        className="w-full border rounded px-2 py-1 text-xs"
                        placeholder="caption(옵션)"
                        value={b.caption ?? ""}
                        onChange={(e) =>
                          patchBlock(b.id, { caption: e.target.value } as Partial<WelcomeBlock>)
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="px-2 py-1 text-xs border rounded text-red-600"
                      onClick={() =>
                        patchBlock(
                          b.id,
                          {
                            file: undefined,
                            imagePath: undefined,
                          } as Partial<WelcomeBlock>,
                        )
                      }
                    >
                      이미지 제거
                    </button>

                    <div className="text-[11px] text-gray-500">
                      파일을 선택했다면 uploadKey는 필수입니다. 저장 시{" "}
                      <code>file:uploadKey</code>로 치환됩니다.
                    </div>
                  </div>
                </div>
              )}

              {b.type === "card" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
                    <div className="flex flex-col gap-2">{renderPreview(b)}</div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="카드 제목"
                          value={b.title ?? ""}
                          onChange={(e) =>
                            patchBlock(b.id, { title: e.target.value } as Partial<WelcomeBlock>)
                          }
                        />
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="카드 설명(옵션)"
                          value={b.desc ?? ""}
                          onChange={(e) =>
                            patchBlock(b.id, { desc: e.target.value } as Partial<WelcomeBlock>)
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="uploadKey (예: card1)"
                          value={b.uploadKey ?? ""}
                          onChange={(e) =>
                            patchBlock(
                              b.id,
                              { uploadKey: normalizeKey(e.target.value) } as Partial<WelcomeBlock>,
                            )
                          }
                        />
                        <label className="w-full px-3 py-1 text-xs border rounded cursor-pointer hover:bg-gray-50 text-center">
                          카드 이미지 선택
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.currentTarget.value = "";
                              if (!file) return;
                              patchBlock(b.id, { file } as Partial<WelcomeBlock>);
                            }}
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="px-2 py-1 text-xs border rounded text-red-600"
                        onClick={() =>
                          patchBlock(
                            b.id,
                            {
                              file: undefined,
                              imagePath: undefined,
                            } as Partial<WelcomeBlock>,
                          )
                        }
                      >
                        이미지 제거
                      </button>

                      <div className="text-[11px] text-gray-500">
                        카드에 파일을 연결하면 uploadKey와 함께 저장됩니다.
                      </div>
                    </div>
                  </div>

                  <div className="border rounded p-2 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">카드 버튼</span>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        onClick={() => addCardButton(b.id)}
                      >
                        + 버튼 추가
                      </button>
                    </div>

                    {(b.buttons?.length ?? 0) === 0 && (
                      <div className="text-xs text-gray-500">
                        버튼을 추가하면 클릭 시 payload 문장이 전송됩니다.
                      </div>
                    )}

                    <div className="space-y-2">
                      {(b.buttons ?? []).map((btn, bi) => (
                        <div
                          key={bi}
                          className="border rounded p-2 bg-gray-50 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-600">#{bi + 1}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="px-1 text-xs border rounded"
                                onClick={() => moveCardButton(b.id, bi, -1)}
                                disabled={bi === 0}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="px-1 text-xs border rounded"
                                onClick={() => moveCardButton(b.id, bi, 1)}
                                disabled={bi === (b.buttons?.length ?? 1) - 1}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="px-2 text-xs border rounded text-red-500 hover:bg-red-50"
                                onClick={() => removeCardButton(b.id, bi)}
                              >
                                삭제
                              </button>
                            </div>
                          </div>

                          <input
                            className="w-full border rounded px-2 py-1 text-xs"
                            placeholder="버튼 라벨"
                            value={btn.label ?? ""}
                            onChange={(e) =>
                              updateCardButton(b.id, bi, { label: e.target.value })
                            }
                          />
                          <input
                            className="w-full border rounded px-2 py-1 text-xs"
                            placeholder="클릭 시 전송할 payload"
                            value={btn.payload ?? ""}
                            onChange={(e) =>
                              updateCardButton(b.id, bi, { payload: e.target.value })
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-gray-500 mt-2">
                      사용자 클릭 시 입력창으로 payload가 들어갑니다.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

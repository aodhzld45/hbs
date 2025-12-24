import React from "react";
import type { WelcomeBlock } from "../../PromptProfile/types/welcomeBlockConfig";

export default function WelcomeBlocksPreview({
  blocks,
  onClickPayload,
}: {
  blocks: WelcomeBlock[];
  onClickPayload?: (payload: string) => void;
}) {
  const sorted = blocks
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full flex justify-center">
      {/* 가운데 정렬 + 최대폭 제한으로 좌우 균형 */}
      <div className="w-full max-w-[560px]">{children}</div>
    </div>
  );

  const Surface: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
  }) => (
    <div
      className={[
        "w-full",
        "rounded-2xl",
        "bg-white/95",
        "shadow-sm",
        "ring-1 ring-black/5",
        "backdrop-blur",
        "overflow-hidden",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {sorted.map((b) => {
        // ===== TEXT =====
        if (b.type === "text") {
          return (
            <Wrap key={b.id}>
              <Surface>
                <div className="px-5 py-4">
                  {b.title ? (
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      {b.title}
                    </div>
                  ) : null}
                  <div className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                    {b.body}
                  </div>
                </div>
              </Surface>
            </Wrap>
          );
        }

        // ===== IMAGE =====
        if (b.type === "image") {
          return (
            <Wrap key={b.id}>
              <Surface>
                <div className="p-4">
                  {b.imagePath ? (
                    <img
                      src={b.imagePath}
                      alt={b.alt ?? ""}
                      className="w-full max-h-72 object-contain rounded-xl bg-black/5"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="text-xs text-gray-500 py-10 text-center">
                      이미지 없음
                    </div>
                  )}

                  {b.caption ? (
                    <div className="mt-3 text-xs text-gray-600 whitespace-pre-wrap break-words">
                      {b.caption}
                    </div>
                  ) : null}
                </div>
              </Surface>
            </Wrap>
          );
        }

        // ===== CARD =====
        return (
          <Wrap key={b.id}>
            <Surface>
              <div className="p-4">
                {/* 상단: 이미지 + 텍스트를 안정적인 2컬럼 */}
                <div className="grid grid-cols-[96px_1fr] gap-4 items-start">
                  {/* 이미지 */}
                  <div className="w-24 h-24 rounded-2xl bg-black/5 overflow-hidden flex items-center justify-center">
                    {b.imagePath ? (
                      <img
                        src={b.imagePath}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-[11px] text-gray-500">no image</span>
                    )}
                  </div>

                  {/* 텍스트 */}
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-900 leading-snug">
                      {b.title || "제목 없음"}
                    </div>
                    {b.desc ? (
                      <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
                        {b.desc}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 버튼 영역: 아래쪽에 정돈 */}
                {(b.buttons ?? []).length > 0 ? (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {(b.buttons ?? []).map((btn, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={[
                          "px-4 py-2",
                          "text-sm",
                          "rounded-xl",
                          "bg-gray-50",
                          "hover:bg-gray-100 active:bg-gray-200",
                          "border border-black/10",
                          "text-gray-900",
                          "transition",
                        ].join(" ")}
                        onClick={() => onClickPayload?.(btn.payload)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </Surface>
          </Wrap>
        );
      })}
    </div>
  );
}

import React from "react";
import type { WelcomeActionItem, WelcomeBlock } from "../../PromptProfile/types/welcomeBlockConfig";

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
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[560px]">{children}</div>
    </div>
  );

  const Surface: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
  }) => (
    <div
      className={[
        "w-full overflow-hidden rounded-2xl bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );

  const ActionButton: React.FC<{ item: WelcomeActionItem; compact?: boolean }> = ({
    item,
    compact = false,
  }) => (
    <button
      type="button"
      className={[
        "rounded-xl border border-black/10 bg-gray-50 text-gray-900 transition hover:bg-gray-100 active:bg-gray-200",
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
      ].join(" ")}
      onClick={() => onClickPayload?.(item.payload)}
    >
      {item.label || item.payload}
    </button>
  );

  return (
    <div className="w-full space-y-4">
      {sorted.map((block) => {
        if (block.type === "intro" || block.type === "text") {
          const title = block.type === "intro" ? block.title : block.title;
          const body = block.type === "intro" ? block.body : block.body;
          return (
            <Wrap key={block.id}>
              <Surface>
                <div className="px-5 py-4">
                  {title ? <div className="mb-1 text-xs font-semibold text-gray-700">{title}</div> : null}
                  <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-900">
                    {body}
                  </div>
                </div>
              </Surface>
            </Wrap>
          );
        }

        if (block.type === "notice") {
          const toneClass =
            block.tone === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : block.tone === "danger"
                ? "border-red-200 bg-red-50 text-red-900"
                : block.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-blue-200 bg-blue-50 text-blue-900";
          return (
            <Wrap key={block.id}>
              <div className={`rounded-2xl border px-5 py-4 ${toneClass}`}>
                {block.title ? <div className="mb-1 text-xs font-semibold">{block.title}</div> : null}
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{block.body}</div>
              </div>
            </Wrap>
          );
        }

        if (block.type === "image") {
          return (
            <Wrap key={block.id}>
              <Surface>
                <div className="p-4">
                  {block.imagePath ? (
                    <img
                      src={block.imagePath}
                      alt={block.alt ?? ""}
                      className="max-h-72 w-full rounded-xl bg-black/5 object-contain"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="py-10 text-center text-xs text-gray-500">이미지 없음</div>
                  )}

                  {block.caption ? (
                    <div className="mt-3 whitespace-pre-wrap break-words text-xs text-gray-600">
                      {block.caption}
                    </div>
                  ) : null}
                </div>
              </Surface>
            </Wrap>
          );
        }

        if (block.type === "categoryGrid") {
          return (
            <Wrap key={block.id}>
              <Surface>
                <div className="p-4">
                  <div className="mb-3">
                    <div className="text-base font-semibold text-gray-900">{block.title || "카테고리"}</div>
                    {block.subtitle ? <div className="mt-1 text-xs text-gray-500">{block.subtitle}</div> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {block.items.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        className="rounded-xl border border-black/10 bg-gray-50 px-3 py-3 text-left transition hover:bg-gray-100"
                        onClick={() => onClickPayload?.(item.payload)}
                      >
                        <div className="text-sm font-semibold text-gray-900">{item.label || item.payload}</div>
                        {item.description ? (
                          <div className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{item.description}</div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </Surface>
            </Wrap>
          );
        }

        if (block.type === "faqList") {
          return (
            <Wrap key={block.id}>
              <Surface>
                <div className="p-4">
                  <div className="mb-3 text-base font-semibold text-gray-900">{block.title || "자주 묻는 질문"}</div>
                  <div className="divide-y divide-gray-100">
                    {block.items.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm text-gray-800 hover:text-blue-700"
                        onClick={() => onClickPayload?.(item.payload)}
                      >
                        <span>{item.label || item.payload}</span>
                        <span className="text-xs text-gray-400">질문</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Surface>
            </Wrap>
          );
        }

        if (block.type === "quickReplies") {
          return (
            <Wrap key={block.id}>
              <div className="flex flex-wrap gap-2">
                {block.title ? <div className="basis-full text-xs font-medium text-gray-500">{block.title}</div> : null}
                {block.items.map((item, index) => (
                  <ActionButton key={index} item={item} compact />
                ))}
              </div>
            </Wrap>
          );
        }

        return (
          <Wrap key={block.id}>
            <Surface>
              <div className="p-4">
                <div className="text-base font-semibold text-gray-900">{block.title || "카드"}</div>
                {block.desc ? <div className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{block.desc}</div> : null}
                {(block.buttons ?? []).length > 0 ? (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {(block.buttons ?? []).map((button, index) => (
                      <ActionButton key={index} item={button} />
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

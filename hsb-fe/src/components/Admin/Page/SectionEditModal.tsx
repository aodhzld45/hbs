import React, { useState } from "react";
import { X } from "lucide-react";

interface Block {
  type: string;
  tag?: string;
  content?: string;
  src?: string;
  label?: string;
  className?: string;
}

interface TailwindOptions {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  alignment?: string;
  paddingY?: string;
}

interface Level2EditorModalProps {
  onClose: () => void;
}

const SectionEditModal: React.FC<Level2EditorModalProps> = ({ onClose }) => {
  const [layout, setLayout] = useState("TWO_COLUMN");

  const [tailwindOptions, setTailwindOptions] = useState<TailwindOptions>({
    backgroundColor: "bg-white",
    textColor: "text-gray-800",
    fontSize: "text-base",
    alignment: "text-left",
    paddingY: "py-8"
  });

  const [leftBlocks, setLeftBlocks] = useState<Block[]>([]);
  const [rightBlocks, setRightBlocks] = useState<Block[]>([]);

  const handleAddBlock = (side: "left" | "right") => {
    const newBlock: Block = {
      type: "TEXT",
      tag: "p",
      content: "새 텍스트",
      className: "text-gray-700"
    };

    if (side === "left") {
      setLeftBlocks([...leftBlocks, newBlock]);
    } else {
      setRightBlocks([...rightBlocks, newBlock]);
    }
  };

  const handleBlockChange = (
    side: "left" | "right",
    index: number,
    field: keyof Block,
    value: string
  ) => {
    const blocks = side === "left" ? [...leftBlocks] : [...rightBlocks];
    blocks[index][field] = value;
    if (side === "left") setLeftBlocks(blocks);
    else setRightBlocks(blocks);
  };

  const tailwindOptionsList = [
    { name: "배경색", key: "backgroundColor", options: ["bg-white", "bg-gray-100", "bg-[#003366]"] },
    { name: "텍스트색", key: "textColor", options: ["text-gray-800", "text-white"] },
    { name: "폰트크기", key: "fontSize", options: ["text-sm", "text-base", "text-xl"] },
    { name: "정렬", key: "alignment", options: ["text-left", "text-center", "text-right"] },
    { name: "수직 패딩", key: "paddingY", options: ["py-4", "py-8", "py-16"] }
  ];

  const jsonPreview = {
    layout,
    tailwindOptions,
    left: leftBlocks,
    right: rightBlocks
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[90vw] max-w-5xl p-8 rounded relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={28} />
        </button>

        <h2 className="text-2xl font-bold mb-6">섹션 상세 편집</h2>

        {/* Layout 선택 */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Layout Type</label>
          <select
            className="border p-2 w-full"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
          >
            <option value="TWO_COLUMN">TWO_COLUMN</option>
            <option value="SINGLE">SINGLE</option>
            <option value="GRID">GRID</option>
          </select>
        </div>

        {/* Tailwind 옵션 선택 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {tailwindOptionsList.map((opt) => (
            <div key={opt.key}>
              <label className="block text-sm font-medium mb-1">{opt.name}</label>
              <select
                className="w-full border p-2"
                value={tailwindOptions[opt.key as keyof TailwindOptions] || ""}
                onChange={(e) =>
                  setTailwindOptions({
                    ...tailwindOptions,
                    [opt.key]: e.target.value
                  })
                }
              >
                <option value="">선택 안 함</option>
                {opt.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* LEFT */}
        <h3 className="text-lg font-semibold mt-8 mb-2">LEFT COLUMN</h3>
        <button
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          onClick={() => handleAddBlock("left")}
        >
          + 블록 추가
        </button>
        {leftBlocks.map((block, idx) => (
          <div
            key={idx}
            className="border p-4 mb-2 rounded bg-gray-50"
          >
            <label className="block text-sm font-medium">Type</label>
            <select
              className="w-full border p-2 mb-2"
              value={block.type}
              onChange={(e) =>
                handleBlockChange("left", idx, "type", e.target.value)
              }
            >
              <option value="TEXT">TEXT</option>
              <option value="IMAGE">IMAGE</option>
              <option value="VIDEO">VIDEO</option>
              <option value="BUTTON">BUTTON</option>
            </select>
            {block.type === "TEXT" && (
              <>
                <input
                  type="text"
                  placeholder="tag"
                  className="w-full border p-2 mb-2"
                  value={block.tag}
                  onChange={(e) =>
                    handleBlockChange("left", idx, "tag", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="content"
                  className="w-full border p-2 mb-2"
                  value={block.content}
                  onChange={(e) =>
                    handleBlockChange("left", idx, "content", e.target.value)
                  }
                />
              </>
            )}
            {block.type === "IMAGE" && (
              <input
                type="text"
                placeholder="src"
                className="w-full border p-2 mb-2"
                value={block.src}
                onChange={(e) =>
                  handleBlockChange("left", idx, "src", e.target.value)
                }
              />
            )}
          </div>
        ))}

        {/* RIGHT */}
        {layout === "TWO_COLUMN" && (
          <>
            <h3 className="text-lg font-semibold mt-8 mb-2">RIGHT COLUMN</h3>
            <button
              className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              onClick={() => handleAddBlock("right")}
            >
              + 블록 추가
            </button>
            {rightBlocks.map((block, idx) => (
              <div
                key={idx}
                className="border p-4 mb-2 rounded bg-gray-50"
              >
                <label className="block text-sm font-medium">Type</label>
                <select
                  className="w-full border p-2 mb-2"
                  value={block.type}
                  onChange={(e) =>
                    handleBlockChange("right", idx, "type", e.target.value)
                  }
                >
                  <option value="TEXT">TEXT</option>
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="BUTTON">BUTTON</option>
                </select>
                {block.type === "TEXT" && (
                  <>
                    <input
                      type="text"
                      placeholder="tag"
                      className="w-full border p-2 mb-2"
                      value={block.tag}
                      onChange={(e) =>
                        handleBlockChange("right", idx, "tag", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="content"
                      className="w-full border p-2 mb-2"
                      value={block.content}
                      onChange={(e) =>
                        handleBlockChange("right", idx, "content", e.target.value)
                      }
                    />
                  </>
                )}
                {block.type === "IMAGE" && (
                  <input
                    type="text"
                    placeholder="src"
                    className="w-full border p-2 mb-2"
                    value={block.src}
                    onChange={(e) =>
                      handleBlockChange("right", idx, "src", e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </>
        )}

        {/* JSON 미리보기 */}
        <h3 className="text-lg font-bold mt-10 mb-2">JSON Preview</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm max-h-48 overflow-y-auto">
          {JSON.stringify(jsonPreview, null, 2)}
        </pre>

        {/* 저장 버튼 */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => {
              console.log(jsonPreview);
              alert("JSON 저장!");
            }}
          >
            저장
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionEditModal;

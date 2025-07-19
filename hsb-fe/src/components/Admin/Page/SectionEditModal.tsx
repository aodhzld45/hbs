import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { fetchSectionCreate } from "../../../services/Admin/pageSectionApi";
import { PageSectionItem } from "../../../types/Admin/PageSectionItem";

interface Block {
  type: string;
  tag?: string;
  content?: string;
  src?: string | File;
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

type Props = {
  pageId: number;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  initialData: PageSectionItem | null;
};

const SectionEditModal: React.FC<Props> = ({
  pageId,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { admin } = useAuth();

  const [form, setForm] = useState({
    sectionName: initialData?.sectionName || "",
    layout: initialData?.layoutType || "TWO_COLUMN",
    tailwindOptions: initialData?.optionJson?.tailwindOptions || {
      backgroundColor: "bg-white",
      textColor: "text-gray-800",
      fontSize: "text-base",
      alignment: "text-left",
      paddingY: "py-8",
    },
  });

  const [leftBlocks, setLeftBlocks] = useState<Block[]>(
    initialData?.optionJson?.left || []
  );
  const [rightBlocks, setRightBlocks] = useState<Block[]>(
    initialData?.optionJson?.right || []
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("tailwind_")) {
      const key = name.replace("tailwind_", "") as keyof TailwindOptions;
      setForm((prev) => ({
        ...prev,
        tailwindOptions: {
          ...prev.tailwindOptions,
          [key]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddBlock = (side: "left" | "right") => {
    const newBlock: Block = {
      type: "TEXT",
      tag: "p",
      content: "새 텍스트",
      className: "text-gray-700",
    };

    side === "left"
      ? setLeftBlocks([...leftBlocks, newBlock])
      : setRightBlocks([...rightBlocks, newBlock]);
  };

  const handleBlockChange = (
    side: "left" | "right",
    index: number,
    field: keyof Block,
    value: string | File
  ) => {
    const blocks = side === "left" ? [...leftBlocks] : [...rightBlocks];
    blocks[index][field] = value as any;
    side === "left" ? setLeftBlocks(blocks) : setRightBlocks(blocks);
  };

  const handleDeleteBlock = (side: "left" | "right", index: number) => {
    const blocks = side === "left" ? [...leftBlocks] : [...rightBlocks];
    blocks.splice(index, 1); // 해당 인덱스 삭제
    side === "left" ? setLeftBlocks(blocks) : setRightBlocks(blocks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      const optionJson = {
        layout: form.layout,
        tailwindOptions: form.tailwindOptions,
        left: leftBlocks,
        right: rightBlocks,
      };

      formData.append("pageId", pageId.toString());
      formData.append("sectionName", form.sectionName);
      formData.append("layoutType", form.layout);
      formData.append("optionJson", JSON.stringify(optionJson));
      formData.append("orderSeq", initialData?.orderSeq?.toString() || "1");
      formData.append("useTf", "Y");
      formData.append("adminId", admin?.id || "admin001");

      [...leftBlocks, ...rightBlocks].forEach((block) => {
        if (
          (block.type === "IMAGE" || block.type === "VIDEO") &&
          block.src instanceof File
        ) {
          formData.append("files", block.src);
        }
      });

      await fetchSectionCreate(formData);
      alert("등록 성공");
      onClose();
      onSuccess();
    } catch (err) {
      console.error("등록 실패:", err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  const tailwindOptionsList = [
    {
      name: "배경색",
      key: "backgroundColor",
      options: ["bg-white", "bg-gray-100", "bg-[#003366]"],
    },
    { name: "텍스트색", key: "textColor", options: ["text-gray-800", "text-white"] },
    { name: "폰트크기", key: "fontSize", options: ["text-sm", "text-base", "text-xl"] },
    {
      name: "정렬",
      key: "alignment",
      options: ["text-left", "text-center", "text-right"],
    },
    {
      name: "수직 패딩",
      key: "paddingY",
      options: ["py-4", "py-8", "py-16"],
    },
  ];

  const renderBlockEditor = (
    block: Block,
    side: "left" | "right",
    idx: number
  ) => (
    <div key={idx} className="border p-4 mb-2 rounded bg-gray-50 relative">
      {/* 삭제 버튼 – 오른쪽 상단 */}
      <button
        type="button"
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
        onClick={() => handleDeleteBlock(side, idx)}
      >
        삭제
      </button>
  
      <label className="block text-sm font-medium">Type</label>
      <select
        className="w-full border p-2 mb-2"
        value={block.type}
        onChange={(e) => handleBlockChange(side, idx, "type", e.target.value)}
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
            onChange={(e) => handleBlockChange(side, idx, "tag", e.target.value)}
          />
          <input
            type="text"
            placeholder="content"
            className="w-full border p-2 mb-2"
            value={block.content}
            onChange={(e) =>
              handleBlockChange(side, idx, "content", e.target.value)
            }
          />
        </>
      )}
  
      {(block.type === "IMAGE" || block.type === "VIDEO") && (
        <input
          type="file"
          accept={block.type === "IMAGE" ? "image/*" : "video/*"}
          className="w-full border p-2 mb-2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleBlockChange(side, idx, "src", file);
            }
          }}
        />
      )}
    </div>
  );
  

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[90vw] max-w-5xl p-8 rounded relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={28} />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          섹션 상세 {initialData ?
            "수정" : "등록"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">섹션 제목</label>
            <input
              type="text"
              name="sectionName"
              className="w-full border p-2"
              value={form.sectionName}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Layout Type</label>
            <select
              name="layout"
              className="w-full border p-2"
              value={form.layout}
              onChange={handleChange}
            >
              <option value="TWO_COLUMN">TWO_COLUMN</option>
              <option value="SINGLE">SINGLE</option>
              <option value="GRID">GRID</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {tailwindOptionsList.map((opt) => (
              <div key={opt.key}>
                <label className="block text-sm font-medium mb-1">{opt.name}</label>
                <select
                  name={`tailwind_${opt.key}`}
                  className="w-full border p-2"
                  value={
                    form.tailwindOptions[opt.key as keyof TailwindOptions] || ""
                  }
                  onChange={handleChange}
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

          <h3 className="text-lg font-semibold mt-8 mb-2">LEFT COLUMN</h3>
          <button
            type="button"
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            onClick={() => handleAddBlock("left")}
          >
            + 블록 추가
          </button>
          {leftBlocks.map((block, idx) =>
            renderBlockEditor(block, "left", idx)
          )}

          {form.layout === "TWO_COLUMN" && (
            <>
              <h3 className="text-lg font-semibold mt-8 mb-2">RIGHT COLUMN</h3>
              <button
                type="button"
                className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                onClick={() => handleAddBlock("right")}
              >
                + 블록 추가
              </button>
              {rightBlocks.map((block, idx) =>
                renderBlockEditor(block, "right", idx)
              )}
            </>
          )}

          <h3 className="text-lg font-bold mt-10 mb-2">JSON Preview</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm max-h-48 overflow-y-auto">
            {JSON.stringify(
              {
                layout: form.layout,
                tailwindOptions: form.tailwindOptions,
                left: leftBlocks,
                right: rightBlocks,
              },
              null,
              2
            )}
          </pre>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              저장
            </button>
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionEditModal;

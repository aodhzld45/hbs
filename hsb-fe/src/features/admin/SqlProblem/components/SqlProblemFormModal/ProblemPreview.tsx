// src/features/SqlProblem/components/ProblemPreview.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProblemPreviewProps {
  title: string;
  level?: number;
  tags?: string[];
  descriptionMd: string;
  regDate?: string; 
}

const ProblemPreview: React.FC<ProblemPreviewProps> = ({
  title,
  level,
  tags,
  descriptionMd,
  regDate,
}) => {
  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm space-y-4">
      {/* 제목 + 등록일 */}
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {regDate && (
          <div className="text-lg font-bold text-gray-700">
            등록일 {regDate.slice(0, 10)}
          </div>
        )}
      </div>
      {/* 난이도 + 태그 */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {level !== undefined && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
            Lv.{level}
          </span>
        )}
        {tags?.map((t, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* 설명 (마크다운) */}
      <div className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h3: ({ node, children, ...props }) => (
              <h3
                className="font-bold text-lg text-gray-800 mt-4 mb-2"
                {...props}
              >
                {children}
              </h3>
            ),
            table: ({ node, ...props }) => (
              <table className="table-auto border-collapse border border-gray-400 my-3" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="border border-gray-400 px-2 py-1 bg-gray-100" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-gray-400 px-2 py-1" {...props} />
            ),
          }}
        >
          {descriptionMd}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ProblemPreview;

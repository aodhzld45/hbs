import React, { JSX } from "react";
import { Block } from "../../../types/Admin/PageSectionItem";
import { FILE_BASE_URL } from "../../../config/config";

interface Props {
  layoutType: string;
  optionJson: any;
}

const DynamicSection: React.FC<Props> = ({ layoutType, optionJson }) => {
  const { left = [], right = [], tailwindOptions } = optionJson;

  const resolveMediaSrc = (src: any): string => {
    if (typeof src !== "string") return "";
    if (src.startsWith("http") || src.startsWith("/")) return src;
    return `${FILE_BASE_URL}${src}`;
  };

  const renderBlock = (block: Block, idx: number) => {
    if (block.type === "IMAGE") {
      const imageUrl = resolveMediaSrc(block.src);
      return (
        <img
          key={idx}
          src={imageUrl}
          alt={block.label || `image-${idx}`}
          className="max-w-full max-h-64"
        />
      );
    } else if (block.type === "VIDEO") {
      const videoUrl = resolveMediaSrc(block.src);
      return (
        <video
          key={idx}
          src={videoUrl}
          controls
          className="w-full rounded border aspect-video object-contain"
        />
      );
    } else if (block.type === "TEXT") {
      const Tag = (block.tag as keyof JSX.IntrinsicElements) || "p";
      const textColor = tailwindOptions?.textColor ?? "";
      const fontSize = tailwindOptions?.fontSize ?? "";
      const fontWeight = tailwindOptions?.fontWeight ?? "";
      const alignment = tailwindOptions?.alignment ?? "";

      const mergedClassName = [
        textColor,
        fontSize,
        fontWeight,
        alignment,
        block.className || "",
      ]
        .join(" ")
        .trim();

      return (
        <Tag key={idx} className={mergedClassName}>
          {block.content}
        </Tag>
      );
    } else if (block.type === "BUTTON") {
      return (
        <button key={idx} className="px-4 py-2 bg-blue-600 text-white rounded">
          {block.content || "버튼"}
        </button>
      );
    }

    return null;
  };

  //  SINGLE Layout
  if (layoutType === "SINGLE") {
    return (
      <div
        className={`space-y-4 w-full ${tailwindOptions?.backgroundColor ?? ""} ${tailwindOptions?.paddingY ?? ""}`}
      >
        {left.map(renderBlock)}
      </div>
    );
  }

  //  TWO_COLUMN Layout
  if (layoutType === "TWO_COLUMN") {
    return (
      <div
        className={`flex flex-col md:flex-row gap-8 w-full ${tailwindOptions?.backgroundColor ?? ""} ${tailwindOptions?.paddingY ?? ""}`}
      >
        <div className="flex-1 space-y-4">{left.map(renderBlock)}</div>
        <div className="flex-1 space-y-4">{right.map(renderBlock)}</div>
      </div>
    );
  }

  //  GRID Layout
  if (layoutType === "GRID") {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full ${tailwindOptions?.backgroundColor ?? ""} ${tailwindOptions?.paddingY ?? ""}`}
      >
        {[...left, ...right].map(renderBlock)}
      </div>
    );
  }

  // fallback
  return null;
};

export default DynamicSection;

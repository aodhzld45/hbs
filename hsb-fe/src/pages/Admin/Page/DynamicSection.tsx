import React, { JSX } from "react";
import { Block } from "../../../types/Admin/PageSectionItem";

interface Props {
  layoutType: string;
  optionJson: any;
}

const DynamicSection: React.FC<Props> = ({ layoutType, optionJson }) => {
  const { left = [], right = [], layout = layoutType, tailwindOptions } = optionJson;

  const renderBlock = (block: Block, idx: number) => {
    if (block.type === 'IMAGE' && typeof block.src === 'string') {
      return <img key={idx} src={block.src} alt={block.label || `image-${idx}`} className="max-w-full max-h-64" />;
    } else if (block.type === 'VIDEO' && typeof block.src === 'string') {
      return (
        <video
          key={idx}
          src={block.src}
          controls
          className="w-full rounded border aspect-video object-contain"
        />
      );
    } else if (block.type === 'TEXT') {
      const Tag = block.tag as keyof JSX.IntrinsicElements || 'p';
      const textColor = tailwindOptions?.textColor ?? '';
      const fontSize = tailwindOptions?.fontSize ?? '';
      const fontWeight = tailwindOptions?.fontWeight ?? '';
      const alignment = tailwindOptions?.alignment ?? '';

      const mergedClassName = [
        textColor,
        fontSize,
        fontWeight,
        alignment,
        block.className || '',
      ]
        .join(' ')
        .trim();
      return (
        <Tag key={idx} className={mergedClassName}>
        {block.content}
        </Tag>
      );
    } else if (block.type === 'BUTTON') {
      return (
        <button key={idx} className="px-4 py-2 bg-blue-600 text-white rounded">
          {block.content || '버튼'}
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`w-full ${tailwindOptions?.backgroundColor ?? ''}`}>
      <div
        className={`
          flex flex-wrap gap-4
          ${tailwindOptions?.paddingY ?? ''}
          ${tailwindOptions?.textColor ?? ''}
          ${tailwindOptions?.fontSize ?? ''}
          ${tailwindOptions?.alignment ?? ''}
        `}
      >
        {/* 왼쪽 영역 */}
        <div className="flex-1 space-y-4">
          {left.map(renderBlock)}
        </div>
  
        {/* 오른쪽 영역 */}
        {right?.length > 0 && (
          <div className="flex-1 space-y-4">
            {right.map(renderBlock)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicSection;

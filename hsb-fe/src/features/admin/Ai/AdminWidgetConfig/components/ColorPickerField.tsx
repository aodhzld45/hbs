import React from 'react';

type Props = {
  label: string;
  value?: string;                 // '#RRGGBB' 권장
  onChange: (next: string) => void;
  presets?: string[];             // 미니 팔레트
  disabled?: boolean;
  name?: string;
};

const DEFAULT_PRESETS = [
  '#4f46e5', '#111827', '#0b0f1a', '#1f2937', '#0f1422',
  '#ffffff', '#f3f4f6', '#e5e7eb', '#10b981', '#ef4444',
  '#f59e0b', '#3b82f6', '#9333ea', '#14b8a6', '#64748b',
];

export default function ColorPickerField({
  label,
  value = '',
  onChange,
  presets = DEFAULT_PRESETS,
  disabled,
  name,
}: Props) {
  // 간단 HEX 정규식 (#RGB, #RRGGBB)
  const isValidHex = (v: string) =>
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());

  const safe = isValidHex(value) ? value : '#000000';

  return (
    <div className="grid grid-cols-3 gap-2 items-center">
      <label className="text-sm">{label}</label>

      {/* color input + 미니 미리보기 */}
      <div className="col-span-2 flex items-center gap-2">
        <input
          type="color"
          className="h-9 w-12 cursor-pointer border rounded"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={`${label} color picker`}
        />

        {/* HEX 텍스트 입력 (직접 붙여넣기 용이) */}
        <input
          name={name}
          className="flex-1 border rounded px-2 py-1 text-sm"
          placeholder="#RRGGBB"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* 프리셋 스와치 */}
      <div className="col-span-3 flex flex-wrap gap-2 mt-1">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            className="h-7 w-7 rounded border"
            style={{ background: c }}
            onClick={() => onChange(c)}
            title={c}
            aria-label={`Preset ${c}`}
          />
        ))}
      </div>

      {/* 유효성 힌트 */}
      {!isValidHex(value) && value?.length > 0 && (
        <div className="col-span-3 text-xs text-red-500">
          유효한 HEX 형식이 아닙니다. 예: #4f46e5 또는 #fff
        </div>
      )}
    </div>
  );
}
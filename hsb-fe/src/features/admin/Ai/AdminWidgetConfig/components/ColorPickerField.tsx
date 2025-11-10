import React from 'react';
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful';

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

  // 간단 HEX 정규식 (#RGB, #RRGGBB)
  const isHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test((v||'').trim());
  const toSafeHex = (v?: string) => (isHex(v || '') ? v! : '#000000');

export default function ColorPickerField({
  label,
  value = '',
  onChange,
  presets = DEFAULT_PRESETS,
  disabled,
  name,
}: Props) {
  const hex = toSafeHex(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm">{label}</label>
        <div className="flex items-center gap-2">
          {/* 미리보기 원형 */}
          <span className="inline-block h-5 w-5 rounded-full border" style={{ background: hex }} />
        </div>
      </div>

      {/* Saturation + Hue + Alpha 슬라이더 포함 */}
      <div className={`rounded-md border p-3 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <HexAlphaColorPicker color={hex} onChange={onChange} />
      </div>

      {/* 텍스트 입력 (#RRGGBB / #RRGGBBAA) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">HEX</span>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-gray-400">#</span>
          <HexColorInput
            color={hex}
            onChange={(v) => onChange('#' + v)}
            prefixed={false}           // 앞에 #는 우리가 붙임
            className="flex-1 border rounded px-2 py-1 text-sm"
            name={name}
            placeholder="4f46e5 또는 4f46e5ff"
          />
        </div>
      </div>

      {/* 프리셋 스와치 */}
      <div className="flex flex-wrap gap-2">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            className="h-7 w-7 rounded border"
            style={{ background: c }}
            title={c}
            onClick={() => onChange(c)}
          />
        ))}
      </div>

      {!isHex(value) && value?.length > 0 && (
        <div className="text-xs text-red-500">
          유효한 HEX가 아닙니다. 예: #4f46e5 또는 #4f46e5ff
        </div>
      )}
    </div>
  );
}
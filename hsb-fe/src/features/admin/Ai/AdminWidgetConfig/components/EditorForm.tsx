import React, { useEffect, useState } from 'react';
import type { WidgetConfig, WidgetConfigRequest } from '../types/widgetConfig';

type Props = {
  value?: WidgetConfig | null;      // id === 0(신규)일 때는 undefined/null 전달
  onSubmit: (data: WidgetConfigRequest) => void;
  onCancel: () => void;
};

export default function EditorForm({ value, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<WidgetConfigRequest>({
    name: '',
    position: 'right',
    offsetX: 20,
    offsetY: 20,
    panelWidthPx: 360,
    zIndex: 2147483000,
    openOnLoad: 'N',
    greetOncePerOpen: 'Y',
    closeOnEsc: 'Y',
    closeOnOutsideClick: 'Y',
  });

  useEffect(() => {
    if (!value) return;
    const { id, useTf, delTf, regDate, upDate, ...rest } = value;
    setForm({ ...form, ...rest });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id]); // 값 바뀔 때만 초기화

  const update = <K extends keyof WidgetConfigRequest>(k: K, v: WidgetConfigRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
    >
      {/* 기본 섹션 */}
      <section className="space-y-3">
        <h3 className="font-semibold">기본</h3>
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="설정 이름"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm self-center">위치</label>
          <select
            className="col-span-2 border rounded px-2 py-2"
            value={form.position}
            onChange={(e) => update('position', e.target.value as 'left' | 'right')}
          >
            <option value="right">right</option>
            <option value="left">left</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm self-center">offsetX</label>
          <input type="number" className="col-span-2 border rounded px-2 py-1"
                 value={form.offsetX ?? 0} onChange={(e) => update('offsetX', +e.target.value)} />
          <label className="text-sm self-center">offsetY</label>
          <input type="number" className="col-span-2 border rounded px-2 py-1"
                 value={form.offsetY ?? 0} onChange={(e) => update('offsetY', +e.target.value)} />
          <label className="text-sm self-center">panelWidthPx</label>
          <input type="number" className="col-span-2 border rounded px-2 py-1"
                 value={form.panelWidthPx ?? 360} onChange={(e) => update('panelWidthPx', +e.target.value)} />
        </div>
      </section>

      {/* 문구/라벨 섹션 */}
      <section className="space-y-3">
        <h3 className="font-semibold">문구/라벨</h3>
        <input className="border rounded px-3 py-2 w-full" placeholder="패널 타이틀"
               value={form.panelTitle || ''} onChange={(e) => update('panelTitle', e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="환영 문구"
               value={form.welcomeText || ''} onChange={(e) => update('welcomeText', e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="입력 placeholder"
               value={form.inputPlaceholder || ''} onChange={(e) => update('inputPlaceholder', e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="보내기 버튼 라벨"
               value={form.sendButtonLabel || ''} onChange={(e) => update('sendButtonLabel', e.target.value)} />
      </section>

      {/* 색상 섹션 */}
      <section className="space-y-3">
        <h3 className="font-semibold">브랜딩 색상</h3>
        {([
          ['primaryColor', 'Primary'],
          ['panelBgColor', 'Panel BG'],
          ['panelTextColor', 'Panel Text'],
          ['bubbleBgColor', 'Bubble BG'],
          ['bubbleFgColor', 'Bubble Text'],
          ['headerBgColor', 'Header BG'],
          ['headerBorderColor', 'Header Border'],
          ['inputBgColor', 'Input BG'],
          ['inputTextColor', 'Input Text'],
        ] as const).map(([key, label]) => (
          <div key={key} className="grid grid-cols-3 gap-2">
            <label className="text-sm self-center">{label}</label>
            <input
              className="col-span-2 border rounded px-2 py-1"
              placeholder="#RRGGBB"
              value={(form as any)[key] || ''}
              onChange={(e) => update(key as any, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* 아이콘/로고 섹션 */}
      <section className="space-y-3">
        <h3 className="font-semibold">아이콘/로고</h3>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm self-center">이모지</label>
          <input className="col-span-2 border rounded px-2 py-1"
                 value={form.bubbleIconEmoji || ''} onChange={(e) => update('bubbleIconEmoji', e.target.value)} />
          <label className="text-sm self-center">아이콘 URL</label>
          <input className="col-span-2 border rounded px-2 py-1"
                 value={form.bubbleIconUrl || ''} onChange={(e) => update('bubbleIconUrl', e.target.value)} />
          <label className="text-sm self-center">로고 URL</label>
          <input className="col-span-2 border rounded px-2 py-1"
                 value={form.logoUrl || ''} onChange={(e) => update('logoUrl', e.target.value)} />
        </div>
        <p className="text-xs text-gray-500">아이콘 URL이 있으면 이모지보다 우선합니다.</p>
      </section>

      {/* 동작 섹션 */}
      <section className="space-y-3">
        <h3 className="font-semibold">동작</h3>
        {([
          ['openOnLoad', '로드 시 자동 열기'],
          ['greetOncePerOpen', '열릴 때 환영 1회만'],
          ['closeOnEsc', 'ESC로 닫기'],
          ['closeOnOutsideClick', '바깥 클릭으로 닫기'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(form as any)[key] === 'Y'}
              onChange={(e) => update(key as any, e.target.checked ? 'Y' : 'N')}
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm self-center">openDelayMs</label>
          <input type="number" className="col-span-2 border rounded px-2 py-1"
                 value={form.openDelayMs ?? 0} onChange={(e) => update('openDelayMs', +e.target.value)} />
        </div>
      </section>

      <div className="lg:col-span-2 flex justify-end gap-2 pt-2">
        <button type="button" className="px-3 py-2 border rounded" onClick={onCancel}>취소</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">저장</button>
      </div>
    </form>
  );
}

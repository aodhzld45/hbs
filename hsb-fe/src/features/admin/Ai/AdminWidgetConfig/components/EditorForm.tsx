import React, { useEffect, useState, useMemo } from 'react';
import type { WidgetConfig, WidgetConfigRequest } from '../types/widgetConfig';

import { fetchSiteKeyList, fetchLinkedSiteKeys } from '../../AdminSiteKeys/services/siteKeyApi'; 
import type { SiteKeySummary } from '../../AdminSiteKeys/types/siteKey';



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

    // 연결할 사이트키
    linkedSiteKeyId: null,
  });

  const [linkedTouched, setLinkedTouched] = useState(false);

    // 사이트키 목록 상태
  const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    const { id, useTf, delTf, regDate, upDate, ...rest } = value;
    setForm((prev) => ({
      ...prev,
      ...rest, // 넘어온 값으로 덮어쓰기
      // linkedSiteKeyId가 value 안에 없으면 기존 유지
      linkedSiteKeyId: rest?.linkedSiteKeyId ?? prev.linkedSiteKeyId ?? null,
    }));    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id]); // 값 바뀔 때만 초기화

  // 사이트키 목록 로드 (ACTIVE 위주, 첫 페이지 크게)
  useEffect(() => {
    (async () => {
      try {
        setLoadingKeys(true);
        setKeysError(null);
        const res = await fetchSiteKeyList({
          keyword: '',
          planCode: '',
          status: 'ACTIVE',
          page: 0,
          size: 200,
          sort: 'regDate,desc',
        });
        setSiteKeys(res.content ?? []);
      } catch (e: any) {
        setKeysError(e?.message ?? '사이트키 조회 실패');
      } finally {
        setLoadingKeys(false);
      }
    })();
  }, []);

  // 수정 모드: 현재 위젯을 기본으로 쓰는 사이트키를 자동 매핑
  useEffect(() => {
  // 신규모드 X, 사용자 미터치, 현재 값 비어있을 때만
    if (!value?.id) return;
    if (linkedTouched) return;
    if (form.linkedSiteKeyId != null) return;

    (async () => {
      try {
        const list = await fetchLinkedSiteKeys(value.id); // GET /ai/site-keys/linked?widgetConfigId=...
        if (Array.isArray(list) && list.length > 0) {
          // 우선순위: ACTIVE & delTf='N' & useTf='Y' -> 없으면 첫 번째
          const best =
            list.find((k: any) => k.status === 'ACTIVE' && k.delTf !== 'Y' && k.useTf === 'Y') ||
            list[0];
          setForm((prev) => ({ ...prev, linkedSiteKeyId: best.id }));
        }
      } catch {
        // 연결 없거나 API 미구현일 수 있음 — 조용히 패스
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id, linkedTouched]);

  const update = <K extends keyof WidgetConfigRequest>(k: K, v: WidgetConfigRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

    // Select 라벨 가독성 향상
  const siteKeyOptions = useMemo(
    () =>
      siteKeys.map((k) => ({
        value: k.id,
        label: `[${k.id}] ${k.siteKey} (${k.planCode ?? '-'}, ${k.status}${
          k.useTf === 'Y' ? '' : ', off'
        })`,
        disabled: k.status !== 'ACTIVE',
      })),
    [siteKeys]
  );

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
          <label className="text-sm self-center">연결 사이트키</label>
          <select
            className="col-span-2 border rounded px-2 py-2"
            value={form.linkedSiteKeyId ?? ''} // '' = 미선택
            onChange={(e) => {
              setLinkedTouched(true); // 사용자가 직접 변경 → 자동 세팅 방지
              update('linkedSiteKeyId', e.target.value ? Number(e.target.value) : null);
            }}
            disabled={loadingKeys || !!keysError}
          >
            <option value="">(선택 없음)</option>
            {siteKeyOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          {loadingKeys && (
            <span className="col-span-3 text-xs text-gray-500">사이트키 불러오는 중…</span>
          )}
          {keysError && <span className="col-span-3 text-xs text-red-500">{keysError}</span>}
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

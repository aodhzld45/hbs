import React, { useEffect, useState, useMemo } from 'react';
import type { WidgetConfig, WidgetConfigRequest } from '../types/widgetConfig';

import { fetchSiteKeyList, fetchLinkedSiteKeys } from '../../AdminSiteKeys/services/siteKeyApi';
 
import type { SiteKeySummary } from '../../AdminSiteKeys/types/siteKey';
import { fetchDefaultPromptProfileBySiteKey } from '../../PromptProfile/services/promptProfileApi';

import { useQuickReplies } from '../hooks/useQuickReplies';

import ColorPickerField from './ColorPickerField';  // 재사용 가능한 컬러 피커 컴포넌트

/** 슬라이더 + 숫자 입력 (크기/둥글기 등) */
function SliderField(
  props: {
    label: string;
    value: number | null;
    onChange: (v: number | null) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    placeholder?: string;
  }
) {
  const { label, value, onChange, min, max, step = 1, unit = 'px', placeholder } = props;
  const num = value ?? min;
  const display = value ?? '';
  return (
    <div className="grid grid-cols-3 gap-2 items-center">
      <label className="text-sm">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value == null ? min : Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(+e.target.value)}
        className="col-span-2 w-full"
      />
      <div className="flex items-center gap-1">
        <input
          type="number"
          className="border rounded px-2 py-1 w-16"
          min={min}
          max={max}
          step={step}
          value={display}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (v === '') { onChange(null); return; }
            const n = +v;
            if (!Number.isNaN(n)) onChange(n);
          }}
        />
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}

/** 테마 프리셋 3종 — 색상 일괄 적용 */
const WIDGET_THEME_PRESETS: Record<string, Partial<WidgetConfigRequest>> = {
  defaultDark: {
    primaryColor: '#4f46e5',
    panelBgColor: '#111827',
    panelTextColor: '#e5e7eb',
    headerBgColor: '#0b0f1a',
    headerBorderColor: '#1f2937',
    inputBgColor: '#0f1422',
    inputTextColor: '#e5e7eb',
    bubbleBgColor: '#4f46e5',
    bubbleFgColor: '#ffffff',
    panelBorderRadiusPx: 16,
    bubbleSizePx: 56,
  },
  light: {
    primaryColor: '#4f46e5',
    panelBgColor: '#f9fafb',
    panelTextColor: '#111827',
    headerBgColor: '#f3f4f6',
    headerBorderColor: '#e5e7eb',
    inputBgColor: '#ffffff',
    inputTextColor: '#111827',
    bubbleBgColor: '#4f46e5',
    bubbleFgColor: '#ffffff',
    panelBorderRadiusPx: 16,
    bubbleSizePx: 56,
  },
  brandPurple: {
    primaryColor: '#7c3aed',
    panelBgColor: '#1e1b4b',
    panelTextColor: '#e9d5ff',
    headerBgColor: '#312e81',
    headerBorderColor: '#4c1d95',
    inputBgColor: '#312e81',
    inputTextColor: '#e9d5ff',
    bubbleBgColor: '#7c3aed',
    bubbleFgColor: '#ffffff',
    panelBorderRadiusPx: 16,
    bubbleSizePx: 56,
  },
};

type Props = {
  value?: WidgetConfig | null;      // id === 0(신규)일 때는 undefined/null 전달
  onSubmit: (data: WidgetConfigRequest, iconFile?: File | null) => void;
  onCancel: () => void;
  onChangePreview?: (cfg: Partial<WidgetConfigRequest>) => void; // 미리보기 패널 value용
  onWelcomeBlocksJsonChange?: (json: string | null) => void;    
};

export default function EditorForm({ value, onSubmit, onCancel, onChangePreview, onWelcomeBlocksJsonChange }: Props) {
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
    // 연결된 프롬프트 프로필
    welcomeBlocksJson: 'null'
  });

  // 퀵리플라이 훅: value에서 내려온 welcomeQuickRepliesJson을 초기값으로 사용
  const {
    rows: quickReplies,
    add: addQuickReply,
    update: updateQuickReply,
    remove: removeQuickReply,
    move: moveQuickReply,
    toJsonOrNull: quickRepliesToJson,
  } = useQuickReplies({
    initialJson: value?.welcomeQuickRepliesJson,
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [iconError, setIconError] = useState<string | null>(null);

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
    // 기존 URL이 있으면 미리보기는 URL로, 파일은 비움
    setIconFile(null);
    setIconPreviewUrl(rest?.bubbleIconUrl || null);
    setIconError(null);

    // 미리보기 패널 초기값 설정
    onChangePreview?.({
      ...rest,
      bubbleIconUrl: rest?.bubbleIconUrl ?? undefined,
    });    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id]); // 값 바뀔 때만 초기화

  // 사이트키 목록 로드 (ACTIVE 위주)
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

  // 연결된 사이트키 id를 파라미터로 프롬프트 프로필 조회
  useEffect(() => {
    const siteKeyId = form.linkedSiteKeyId;
    if (!siteKeyId) return;
  
    (async () => {
      const pp = await fetchDefaultPromptProfileBySiteKey(siteKeyId);

      onWelcomeBlocksJsonChange?.(pp?.welcomeBlocksJson ?? null);
    })();
  }, [form.linkedSiteKeyId, onWelcomeBlocksJsonChange]);

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
    setForm(f => {
      const next = { ...f, [k]: v };
      // 아이콘 파일 미리보기 중이면 그 URL을 우선 사용
      const bubbleIconUrlForPreview = iconPreviewUrl ?? next.bubbleIconUrl ?? undefined;
      onChangePreview?.({ ...next, bubbleIconUrl: bubbleIconUrlForPreview });
      return next;
    });

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

  // 아이콘 첨부파일 관련,
  // 아이콘 파일 선택 이벤트
  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setIconError(null);

    if (!file) {
      setIconFile(null);
      // 파일 선택 취소 시, 기존 URL 미리보기를 유지
      onChangePreview?.({ ...form, bubbleIconUrl: form.bubbleIconUrl ?? undefined });
      return;
    }
    // 간단 검증(이미지 + 1MB)
    if (!file.type.startsWith('image/')) {
      setIconError('이미지 파일만 업로드 가능합니다.');
      e.target.value = '';
      return;
    }
    if (file.size > 9_000_000) {
      setIconError('아이콘 파일은 최대 1MB까지만 허용됩니다.');
      e.target.value = '';
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setIconFile(file);
    setIconPreviewUrl(localUrl);
    // 미리보기 패널에 반영
    onChangePreview?.({ ...form, bubbleIconUrl: localUrl });

  }

  // 아이콘 URL 제거(이모지로 복귀)
  function clearIconUrl() {
    setIconFile(null);
    setIconPreviewUrl(null);
    const next = { ...form, bubbleIconUrl: '' as any }; // 서버에선 '' → 제거
    setForm(next);

    // 이모지로 회귀(아이콘 없음) 상태를 미리보기에도 반영
    onChangePreview?.({ ...next, bubbleIconUrl: undefined });
  }

  // 제출
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 퀵리플라이 배열 → JSON 문자열 (없으면 null)
    const welcomeQuickRepliesJson = quickRepliesToJson();

    const payload: WidgetConfigRequest = {
      ...form,
      welcomeQuickRepliesJson,
    };

    onSubmit(payload, iconFile);
  }

  return (
    <form
      className="flex flex-col max-h-[80vh] lg:max-h-[70vh]"
      onSubmit={handleSubmit}
    >
      <div className="flex-1 overflow-y-auto space-y-6 p-4 lg:p-6">
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
          </div>
          <SliderField
            label="패널 너비(px)"
            value={form.panelWidthPx ?? 360}
            onChange={(v) => update('panelWidthPx', v ?? 360)}
            min={280}
            max={480}
            step={10}
          />
          <SliderField
            label="패널 최대 높이(px)"
            value={form.panelMaxHeightPx ?? 0}
            onChange={(v) => update('panelMaxHeightPx', v === 0 ? null : v)}
            min={0}
            max={700}
            step={20}
            placeholder="0=60vh"
          />
        </section>

        {/* 레이아웃·스타일 (크기/둥글기) */}
        <section className="space-y-3">
          <h3 className="font-semibold">레이아웃·스타일</h3>
          <p className="text-xs text-gray-500">패널·버블 크기와 모서리 둥글기를 설정합니다. (선택)</p>
          <SliderField label="패널 둥글기(px)" value={form.panelBorderRadiusPx ?? null} onChange={(v) => update('panelBorderRadiusPx', v)} min={0} max={24} />
          <SliderField label="버블 크기(px)" value={form.bubbleSizePx ?? null} onChange={(v) => update('bubbleSizePx', v)} min={36} max={96} />
          <SliderField label="입력창 둥글기(px)" value={form.inputBorderRadiusPx ?? null} onChange={(v) => update('inputBorderRadiusPx', v)} min={0} max={20} />
          <SliderField label="전송버튼 둥글기(px)" value={form.sendButtonRadiusPx ?? null} onChange={(v) => update('sendButtonRadiusPx', v)} min={0} max={20} />
        </section>

        {/* 문구/라벨 섹션 */}
        <section className="space-y-3">
          <h3 className="font-semibold">문구/라벨</h3>
          <input className="border rounded px-3 py-2 w-full" placeholder="패널 타이틀"
                value={form.panelTitle || ''} onChange={(e) => update('panelTitle', e.target.value)} />

          <textarea
            className="border rounded px-3 py-2 w-full min-h-[80px]"
            placeholder="환영 문구 (여러 줄 입력 가능)"
            value={form.welcomeText || ''}
            onChange={(e) => update('welcomeText', e.target.value)}
          />

            {/* 초기 추천 질문(퀵리플라이) - 행 기반 UI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">초기 추천 질문(퀵리플라이)</span>
              <button
                type="button"
                className="px-2 py-1 text-xs border rounded"
                onClick={addQuickReply}
              >
                + 항목 추가
              </button>
            </div>

            {quickReplies.length === 0 && (
              <p className="text-xs text-gray-500">
                &quot;+ 항목 추가&quot;를 눌러 추천 질문 버튼을 등록하세요.
              </p>
            )}

            <div className="space-y-2">
              {quickReplies.map((row, idx) => (
                <div
                  key={row.id}
                  className="border rounded p-2 space-y-1 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      #{idx + 1} 순서(order): {row.order}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="px-1 text-xs border rounded"
                        onClick={() => moveQuickReply(row.id, -1)}
                        disabled={idx === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="px-1 text-xs border rounded"
                        onClick={() => moveQuickReply(row.id, 1)}
                        disabled={idx === quickReplies.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="px-1 text-xs border rounded text-red-500"
                        onClick={() => removeQuickReply(row.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="버튼 라벨 (예: 포트폴리오 전체 요약)"
                    value={row.label}
                    onChange={(e) =>
                      updateQuickReply(row.id, { label: e.target.value })
                    }
                  />
                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="클릭 시 보낼 질문 문장"
                    value={row.payload}
                    onChange={(e) =>
                      updateQuickReply(row.id, { payload: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              위젯 최초 오픈 시, 위 항목들이 순서대로 버튼으로 표시되고 클릭 시 해당 질문이 입력·전송됩니다.
            </p>
          </div>

          <input className="border rounded px-3 py-2 w-full" placeholder="입력 placeholder"
                value={form.inputPlaceholder || ''} onChange={(e) => update('inputPlaceholder', e.target.value)} />
          <input className="border rounded px-3 py-2 w-full" placeholder="보내기 버튼 라벨"
                value={form.sendButtonLabel || ''} onChange={(e) => update('sendButtonLabel', e.target.value)} />
        </section>

        {/* 색상 섹션 */}
        <section className="space-y-3">
          <h3 className="font-semibold">브랜딩 색상</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center">테마 프리셋:</span>
            {[
              { id: 'defaultDark', label: '기본 다크', className: 'bg-gray-800 text-white' },
              { id: 'light', label: '라이트', className: 'bg-gray-100 text-gray-800 border border-gray-300' },
              { id: 'brandPurple', label: '브랜드 보라', className: 'bg-violet-600 text-white' },
            ].map(({ id, label, className }) => (
              <button
                key={id}
                type="button"
                className={`px-3 py-1.5 text-sm rounded ${className}`}
                onClick={() => {
                  const preset = WIDGET_THEME_PRESETS[id];
                  if (!preset) return;
                  setForm((f) => {
                    const next = { ...f, ...preset };
                    onChangePreview?.(next);
                    return next;
                  });
                }}
              >
                {label}
              </button>
            ))}
          </div>
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
            <ColorPickerField
              key={key}
              label={label}
              value={(form as any)[key] || ''}
              onChange={(next) => update(key as any, next)}
              name={key}
            />
          ))}
        </section>

        {/* 타이포·디자인 */}
        <section className="space-y-3">
          <h3 className="font-semibold">타이포·디자인</h3>
          <p className="text-xs text-gray-500">폰트, 그림자, 전송 버튼 모양 등 (선택)</p>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-sm self-center">폰트 패밀리</label>
            <select
              className="col-span-2 border rounded px-2 py-2"
              value={form.fontFamily ?? ''}
              onChange={(e) => update('fontFamily', e.target.value || null)}
            >
              <option value="">기본(inherit)</option>
              <option value="system-ui, sans-serif">시스템 기본</option>
              <option value="'Noto Sans KR', sans-serif">Noto Sans KR</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Roboto', sans-serif">Roboto</option>
            </select>
            <SliderField label="본문 글자크기(px)" value={form.fontSizeBasePx ?? null} onChange={(v) => update('fontSizeBasePx', v)} min={12} max={20} />
            <SliderField label="헤더 글자크기(px)" value={form.headerFontSizePx ?? null} onChange={(v) => update('headerFontSizePx', v)} min={12} max={24} />
            <label className="text-sm self-center">전송 버튼 스타일</label>
            <select
              className="col-span-2 border rounded px-2 py-2"
              value={form.sendButtonStyle ?? 'text'}
              onChange={(e) => update('sendButtonStyle', (e.target.value as 'text' | 'icon' | 'icon-text') || 'text')}
            >
              <option value="text">텍스트(보내기)</option>
              <option value="icon">아이콘만</option>
              <option value="icon-text">아이콘+텍스트</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-sm self-center">패널 그림자</label>
            <input className="col-span-2 border rounded px-2 py-1 text-xs" placeholder="예: 0 20px 40px rgba(0,0,0,.35)"
                  value={form.boxShadow ?? ''} onChange={(e) => update('boxShadow', e.target.value || null)} />
            <label className="text-sm self-center">버블 그림자</label>
            <input className="col-span-2 border rounded px-2 py-1 text-xs" placeholder="예: 0 10px 25px rgba(0,0,0,.2)"
                  value={form.bubbleBoxShadow ?? ''} onChange={(e) => update('bubbleBoxShadow', e.target.value || null)} />
          </div>
        </section>

        {/* 아이콘/로고 섹션 */}
        <section className="space-y-3">
          <h3 className="font-semibold">아이콘/로고</h3>

          <div className="grid grid-cols-3 gap-2">
            <label className="text-sm self-center">이모지</label>
            <input
              className="col-span-2 border rounded px-2 py-1"
              value={form.bubbleIconEmoji || ''}
              onChange={(e) => update('bubbleIconEmoji', e.target.value)}
              placeholder="예: 💬"
            />
          </div>

          {/* 기존 URL 표시 + 제거 */}
          <div className="grid grid-cols-3 gap-2 items-start">
            <label className="text-sm self-center">현재 아이콘 URL</label>
            <div className="col-span-2 flex items-center gap-2">
              <input
                className="flex-1 border rounded px-2 py-1 text-xs"
                value={form.bubbleIconUrl || ''}
                onChange={(e) => update('bubbleIconUrl', e.target.value)}
                placeholder="/files/ai_widget/icon/uuid.png"
              />
              {!!form.bubbleIconUrl && (
                <button
                  type="button"
                  className="px-2 py-1 text-xs border rounded"
                  onClick={clearIconUrl}
                  title="아이콘 제거(이모지 사용)"
                >
                  제거
                </button>
              )}
            </div>
          </div>

          {/* 파일 업로드 → 서버에서 URL로 저장 */}
          <div className="grid grid-cols-3 gap-2 items-start">
            <label className="text-sm self-center">아이콘 파일</label>
            <div className="col-span-2 space-y-2">
              <input type="file" accept="image/*" onChange={handleIconChange} />
              {iconError && <div className="text-xs text-red-500">{iconError}</div>}

              {(iconPreviewUrl || form.bubbleIconUrl) && (
                <div className="flex items-center gap-3">
                  <img
                    src={iconPreviewUrl || form.bubbleIconUrl || ''}
                    alt="icon preview"
                    className="w-10 h-10 object-contain border rounded"
                  />
                  {iconPreviewUrl && (
                    <span className="text-xs text-gray-500">
                      (미리보기: 저장 시 업로드됨)
                    </span>
                  )}
                </div>
              )}

              {!iconPreviewUrl && !form.bubbleIconUrl && (
                <p className="text-xs text-gray-500">
                  아이콘 파일을 선택하면 이모지보다 아이콘이 우선 표시됩니다.
                </p>
              )}
            </div>
          </div>
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
      </div>

      <div className="sticky lg:col-span-2 flex justify-center gap-2 pt-2">
        <button type="button" className="px-3 py-2 border rounded" onClick={onCancel}>취소</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">저장</button>
      </div>

    </form>
  );
}

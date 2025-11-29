import React, { useEffect, useState, useMemo } from 'react';
import type { WidgetConfig, WidgetConfigRequest, QuickReplyRow } from '../types/widgetConfig';

import { fetchSiteKeyList, fetchLinkedSiteKeys } from '../../AdminSiteKeys/services/siteKeyApi'; 
import type { SiteKeySummary } from '../../AdminSiteKeys/types/siteKey';
import { useQuickReplies } from '../hooks/useQuickReplies';

import ColorPickerField from './ColorPickerField';  // 재사용 가능한 컬러 피커 컴포넌트

type Props = {
  value?: WidgetConfig | null;      // id === 0(신규)일 때는 undefined/null 전달
  onSubmit: (data: WidgetConfigRequest, iconFile?: File | null) => void;
  onCancel: () => void;
  onChangePreview?: (cfg: Partial<WidgetConfigRequest>) => void; // 미리보기 패널 value용
};

export default function EditorForm({ value, onSubmit, onCancel, onChangePreview }: Props) {
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
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      onSubmit={handleSubmit}
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

      <div className="lg:col-span-2 flex justify-end gap-2 pt-2">
        <button type="button" className="px-3 py-2 border rounded" onClick={onCancel}>취소</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">저장</button>
      </div>
    </form>
  );
}

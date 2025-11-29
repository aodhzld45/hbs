import { useEffect, useState } from 'react';
import type { QuickReplyRow } from '../types/widgetConfig';


type UseQuickRepliesOptions = {
  /** 서버에서 내려온 JSON 문자열 (WidgetConfig.welcomeQuickRepliesJson) */
  initialJson?: string | null;
};

export function useQuickReplies(opts?: UseQuickRepliesOptions) {
  const { initialJson } = opts || {};

  const [rows, setRows] = useState<QuickReplyRow[]>(() =>
    parseQuickRepliesJson(initialJson)
  );

  // initialJson이 바뀔 때마다 상태를 다시 세팅 (수정 모드에서 value 변경 대응)
  useEffect(() => {
    setRows(parseQuickRepliesJson(initialJson));
  }, [initialJson]);

  /** 행 추가 */
  function add() {
    setRows((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
      return [
        ...prev,
        { id: nextId, label: '', payload: '', order: prev.length + 1 },
      ];
    });
  }

  /** 특정 행 수정 */
  function update(id: number, patch: Partial<QuickReplyRow>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  /** 행 삭제 + order 재정렬 */
  function remove(id: number) {
    setRows((prev) => {
      const filtered = prev.filter((row) => row.id !== id);
      return filtered.map((row, idx) => ({ ...row, order: idx + 1 }));
    });
  }

  /** 위/아래 이동 + order 재정렬 */
  function move(id: number, dir: -1 | 1) {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;

      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      return copy.map((row, i) => ({ ...row, order: i + 1 }));
    });
  }

  /** 비어있는 행 제거 후, 백엔드로 보낼 JSON 문자열 생성 */
  function toJsonOrNull(): string | null {
    const effective = rows
      .map((r, idx) => ({
        label: r.label.trim(),
        payload: r.payload.trim(),
        order: r.order ?? idx + 1,
      }))
      .filter((r) => r.label || r.payload);

    if (!effective.length) return null;
    return JSON.stringify(effective);
  }

  return {
    rows,
    setRows,
    add,
    update,
    remove,
    move,
    toJsonOrNull,
  };
}

/** 내부 파서: JSON 문자열 → QuickReplyRow[] */
function parseQuickRepliesJson(json?: string | null): QuickReplyRow[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any, idx: number) => ({
      id: idx + 1,
      label: typeof item.label === 'string' ? item.label : '',
      payload: typeof item.payload === 'string' ? item.payload : '',
      order: typeof item.order === 'number' ? item.order : idx + 1,
    }));
  } catch {
    return [];
  }
}
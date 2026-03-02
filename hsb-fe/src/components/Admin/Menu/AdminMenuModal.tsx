import React, { useState, useMemo, useEffect } from 'react';
import { AdminMenu } from '../../../types/Admin/AdminMenu';

export type AdminMenuWithLabel = AdminMenu & { label?: string };

interface AdminMenuModalProps {
  /** 수정 시 전달, 신규 생성 시 undefined/null */
  menu?: AdminMenu | null;
  /** 기존 메뉴 목록(플랫). 신규 시 권장 순서·상위 메뉴 선택에 사용 */
  existingMenus?: AdminMenuWithLabel[];
  onSave: (menu: AdminMenu) => void;
  onCancel: () => void;
}

/** 같은 부모·같은 depth인 형제들 중 다음 권장 순서 */
function getSuggestedOrder(
  existingMenus: AdminMenuWithLabel[],
  parentId: number | undefined,
  depth: number,
  excludeId?: number
): number {
  const siblings = existingMenus.filter(
    (m) =>
      (m.parentId ?? undefined) === (parentId ?? undefined) &&
      (m.depth ?? 0) === depth &&
      m.id !== excludeId
  );
  if (siblings.length === 0) return 1;
  const maxOrder = Math.max(...siblings.map((m) => m.orderSequence ?? 0));
  return maxOrder + 1;
}

const AdminMenuModal: React.FC<AdminMenuModalProps> = ({
  menu,
  existingMenus = [],
  onSave,
  onCancel,
}) => {
  const isEditMode = !!menu;

  // 초기값: 수정이면 menu 복사, 신규면 디폴트 값(권장 순서 반영)
  const [form, setForm] = useState<AdminMenu>(() => {
    if (menu) return { ...menu };
    const order =
      existingMenus.length > 0
        ? getSuggestedOrder(existingMenus, undefined, 1)
        : 1;
    return {
      id: 0,
      name: '',
      url: '',
      orderSequence: order,
      depth: 1,
      parentId: undefined,
      description: '',
      useTf: 'Y',
      delTf: 'N',
    };
  });

  const suggestedOrder = useMemo(() => {
    return getSuggestedOrder(
      existingMenus,
      form.parentId ?? undefined,
      form.depth ?? 1,
      menu?.id
    );
  }, [existingMenus, form.parentId, form.depth, menu?.id]);

  // 상위 메뉴 선택 옵션: 루트 + depth별 메뉴 (수정 시 자기 자신·자손 제외)
  const parentOptions = useMemo(() => {
    const list: { value: string; label: string; depth: number }[] = [
      { value: '', label: '없음 (루트)', depth: 0 },
    ];
    const maxDepth = Math.max(...existingMenus.map((m) => m.depth ?? 1), 1);
    for (let d = 1; d < maxDepth; d++) {
      existingMenus
        .filter((m) => (m.depth ?? 0) === d)
        .filter((m) => {
          if (!menu?.id) return true;
          if (m.id === menu.id) return false;
          let pid: number | undefined = m.parentId;
          while (pid != null) {
            if (pid === menu.id) return false;
            const p = existingMenus.find((x) => x.id === pid);
            pid = p?.parentId;
          }
          return true;
        })
        .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0))
        .forEach((m) =>
          list.push({
            value: String(m.id!),
            label: m.label ?? m.name,
            depth: d,
          })
        );
    }
    return list;
  }, [existingMenus, menu?.id]);

  // 상위 메뉴 변경 시 depth·권장 순서만 반영 (parentId는 handleChange에서 설정됨)
  useEffect(() => {
    if (isEditMode) return;
    const parentId = form.parentId;
    const option = parentOptions.find((o) => o.value === String(parentId ?? ''));
    const newDepth = option ? option.depth + 1 : 1;
    const suggested = getSuggestedOrder(existingMenus, parentId, newDepth);
    setForm((prev) => ({
      ...prev,
      depth: newDepth,
      orderSequence: suggested,
    }));
  }, [form.parentId, isEditMode, existingMenus]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'orderSequence' || name === 'depth'
          ? Number(value)
          : name === 'parentId'
          ? value === ''
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? '메뉴 수정' : '신규 메뉴 등록'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 섹션 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">기본 정보</h3>

            <div className="mb-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                메뉴 이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="예: 대시보드"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded text-sm"
                required
              />
            </div>

            <div className="mb-1">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                메뉴 URL
              </label>
              <input
                id="url"
                type="text"
                name="url"
                placeholder="예: /admin/dashboard"
                value={form.url}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                라우팅용 경로입니다. 상위 메뉴(폴더형)라면 비워둘 수 있습니다.
              </p>
            </div>
          </div>

          {/* 계층/정렬 섹션 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              계층 &amp; 정렬 정보
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label
                  htmlFor="orderSequence"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  노출 순서 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    id="orderSequence"
                    type="number"
                    name="orderSequence"
                    min={1}
                    placeholder="예: 1"
                    value={form.orderSequence}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    required
                  />
                  {existingMenus.length > 0 && form.orderSequence !== suggestedOrder && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, orderSequence: suggestedOrder }))
                      }
                      className="shrink-0 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                      title="같은 레벨 맨 뒤 순서로 적용"
                    >
                      권장({suggestedOrder})
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  숫자가 작을수록 상단 노출. 같은 레벨 맨 뒤 권장: <strong>{suggestedOrder}</strong>
                </p>
              </div>

              <div>
                <label
                  htmlFor="depth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  뎁스(Depth) <span className="text-red-500">*</span>
                </label>
                <input
                  id="depth"
                  type="number"
                  name="depth"
                  min={1}
                  placeholder="예: 1"
                  value={form.depth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  1: 1차 메뉴, 2: 2차(하위) 메뉴, 3: 3차 메뉴 …
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="parentId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                상위 메뉴
              </label>
              {existingMenus.length > 0 ? (
                <select
                  id="parentId"
                  name="parentId"
                  value={form.parentId != null ? String(form.parentId) : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  {parentOptions.map((opt) => (
                    <option key={opt.value || 'root'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="parentId"
                  type="text"
                  name="parentId"
                  placeholder="루트 메뉴면 비워두세요"
                  value={form.parentId ? form.parentId.toString() : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              )}
              <p className="mt-1 text-xs text-gray-500">
                {existingMenus.length > 0
                  ? '상위 메뉴를 선택하면 뎁스와 권장 순서가 자동으로 설정됩니다.'
                  : '2뎁스 이상인 경우 상위 메뉴 ID를 입력하세요. 루트(1뎁스)는 비워둡니다.'}
              </p>
            </div>
          </div>

          {/* 메모 섹션 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              메모 (옵션)
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="메뉴 용도나 비고 사항을 간단히 남길 수 있습니다."
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm min-h-[70px]"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditMode ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminMenuModal;

import React, { useEffect, useMemo, useState } from 'react';

import { adminRouteComponentOptions } from '../../../routes/admin/adminRouteRegistry';
import { AdminMenu } from '../../../types/Admin/AdminMenu';

export type AdminMenuWithLabel = AdminMenu & { label?: string };

interface AdminMenuModalProps {
  menu?: AdminMenu | null;
  existingMenus?: AdminMenuWithLabel[];
  onSave: (menu: AdminMenu) => void;
  onCancel: () => void;
}

function getSuggestedOrder(
  existingMenus: AdminMenuWithLabel[],
  parentId: number | undefined,
  depth: number,
  excludeId?: number
): number {
  const siblings = existingMenus.filter(
    (item) =>
      (item.parentId ?? undefined) === (parentId ?? undefined) &&
      (item.depth ?? 0) === depth &&
      item.id !== excludeId
  );

  if (siblings.length === 0) {
    return 1;
  }

  return Math.max(...siblings.map((item) => item.orderSequence ?? 0)) + 1;
}

const AdminMenuModal: React.FC<AdminMenuModalProps> = ({
  menu,
  existingMenus = [],
  onSave,
  onCancel,
}) => {
  const isEditMode = Boolean(menu);
  const [validationError, setValidationError] = useState('');

  const [form, setForm] = useState<AdminMenu>(() => {
    if (menu) {
      return { ...menu };
    }

    return {
      id: 0,
      name: '',
      url: '',
      componentKey: '',
      orderSequence:
        existingMenus.length > 0
          ? getSuggestedOrder(existingMenus, undefined, 1)
          : 1,
      depth: 1,
      parentId: undefined,
      description: '',
      useTf: 'Y',
      delTf: 'N',
    };
  });

  const suggestedOrder = useMemo(
    () =>
      getSuggestedOrder(
        existingMenus,
        form.parentId ?? undefined,
        form.depth ?? 1,
        menu?.id
      ),
    [existingMenus, form.parentId, form.depth, menu?.id]
  );

  const parentOptions = useMemo(() => {
    const list: { value: string; label: string; depth: number }[] = [
      { value: '', label: '없음 (루트)', depth: 0 },
    ];

    const maxDepth = Math.max(...existingMenus.map((item) => item.depth ?? 1), 1);
    const menuById = new Map(existingMenus.map((item) => [item.id, item] as const));

    const depthLevels = Array.from({ length: Math.max(maxDepth - 1, 0) }, (_, index) => index + 1);

    depthLevels.forEach((currentDepth) => {
      existingMenus
        .filter((item) => (item.depth ?? 0) === currentDepth)
        .filter((item) => {
          if (!menu?.id) {
            return true;
          }

          if (item.id === menu.id) {
            return false;
          }

          let parentId = item.parentId;
          while (parentId != null) {
            if (parentId === menu.id) {
              return false;
            }

            const parent = menuById.get(parentId);
            parentId = parent?.parentId;
          }

          return true;
        })
        .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0))
        .forEach((item) => {
          list.push({
            value: String(item.id ?? ''),
            label: item.label ?? item.name,
            depth: currentDepth,
          });
        });
    });

    return list;
  }, [existingMenus, menu?.id]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const parentId = form.parentId;
    const selectedParent = parentOptions.find(
      (option) => option.value === String(parentId ?? '')
    );
    const nextDepth = selectedParent ? selectedParent.depth + 1 : 1;

    setForm((prev) => ({
      ...prev,
      depth: nextDepth,
      orderSequence: getSuggestedOrder(existingMenus, parentId, nextDepth),
    }));
  }, [existingMenus, form.parentId, isEditMode, parentOptions]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setValidationError('');

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const hasUrl = Boolean(form.url?.trim());
    const hasComponentKey = Boolean(form.componentKey?.trim());

    if (hasUrl && !hasComponentKey) {
      setValidationError('URL이 있는 관리자 메뉴는 componentKey를 선택해야 합니다.');
      return;
    }

    if (!hasUrl && hasComponentKey) {
      setValidationError('componentKey를 선택한 경우 URL도 함께 입력해야 합니다.');
      return;
    }

    onSave({
      ...form,
      url: form.url.trim(),
      componentKey: form.componentKey.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">
          {isEditMode ? '메뉴 수정' : '신규 메뉴 등록'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">기본 정보</h3>

            <div className="mb-3">
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                메뉴명 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="예: 관리자 메뉴 관리"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="url" className="mb-1 block text-sm font-medium text-gray-700">
                메뉴 URL
              </label>
              <input
                id="url"
                type="text"
                name="url"
                placeholder="예: /admin/admin-menu"
                value={form.url}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                실제 라우팅 경로입니다. 그룹용 상위 메뉴라면 비워둘 수 있습니다.
              </p>
            </div>

            <div>
              <label
                htmlFor="componentKey"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                컴포넌트 키
              </label>
              <select
                id="componentKey"
                name="componentKey"
                value={form.componentKey}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">선택 안 함</option>
                {adminRouteComponentOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label} ({option.key})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                URL과 함께 저장하면 `App.tsx`에서 수동 등록 없이 자동 라우팅됩니다.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              계층 및 정렬 정보
            </h3>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="orderSequence"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  출력 순서 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="orderSequence"
                    type="number"
                    name="orderSequence"
                    min={1}
                    value={form.orderSequence}
                    onChange={handleChange}
                    className="flex-1 rounded border px-3 py-2 text-sm"
                    required
                  />
                  {existingMenus.length > 0 && form.orderSequence !== suggestedOrder && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, orderSequence: suggestedOrder }))
                      }
                      className="rounded border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs hover:bg-gray-200"
                    >
                      권장({suggestedOrder})
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="depth" className="mb-1 block text-sm font-medium text-gray-700">
                  Depth <span className="text-red-500">*</span>
                </label>
                <input
                  id="depth"
                  type="number"
                  name="depth"
                  min={1}
                  value={form.depth}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="parentId"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                상위 메뉴
              </label>
              <select
                id="parentId"
                name="parentId"
                value={form.parentId != null ? String(form.parentId) : ''}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                {parentOptions.map((option) => (
                  <option key={option.value || 'root'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              설명
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="메뉴 용도나 비고를 입력하세요."
              value={form.description}
              onChange={handleChange}
              className="min-h-[80px] w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          {validationError && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {validationError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
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

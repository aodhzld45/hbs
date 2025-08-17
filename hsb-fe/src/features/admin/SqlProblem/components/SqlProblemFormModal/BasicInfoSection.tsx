import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

const CONSTRAINTS = ['SELECT_ONLY', 'DML_ALLOWED'] as const;

const BasicInfoSection: React.FC = () => {
  const { register, setValue, watch } = useFormContext();
  const [tagInput, setTagInput] = useState('');
  const tags: string[] = watch('tags') ?? [];

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setValue('tags', [...tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => {
    setValue(
      'tags',
      (tags ?? []).filter((x: string) => x !== t),
    );
  };
  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <section className="p-4 rounded-xl border bg-white">
      <h4 className="font-semibold mb-3">기본 정보</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 제목 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">제목 *</span>
          <input
            className="input"
            placeholder="문제 제목"
            {...register('title')}
          />
        </label>

        {/* 난이도 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">난이도</span>
          <input
            className="input"
            type="number"
            min={1}
            max={5}
            placeholder="예: 1 ~ 5"
            {...register('level', { valueAsNumber: true })}
          />
        </label>

        {/* 사용 여부 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">사용 여부 *</span>
          <select className="select" {...register('useTf')}>
            <option value="Y">Y</option>
            <option value="N">N</option>
          </select>
        </label>

        {/* 제약 조건 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">제약 조건 *</span>
          <select className="select" {...register('constraintRule')}>
            {CONSTRAINTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* 순서 중요 여부 */}
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" {...register('orderSensitive')} />
          <span className="text-sm">결과 순서 중요</span>
        </label>

        {/* 태그 */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium">태그</span>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Enter 또는 , 로 추가"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKey}
            />
            <button
              type="button"
              className="button-secondary"
              onClick={addTag}
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(tags ?? []).map((t) => (
              <span
                key={t}
                className="px-2 py-1 rounded bg-gray-100 text-sm inline-flex items-center gap-2"
              >
                #{t}
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => removeTag(t)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicInfoSection;

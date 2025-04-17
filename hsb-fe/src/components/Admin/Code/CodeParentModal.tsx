import React, { FormEvent } from 'react';

export interface CodeParentFormValues {
  pcode: string;
  pcodeNm: string;
  pcodeMemo?: string;
  pcodeSeqNo: number;
}

interface Props {
  /** current form values */
  values: CodeParentFormValues;
  /** called on any input change */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** form submit handler */
  onSubmit: (e: FormEvent) => void;
  /** whether this is editing or creating */
  isEditing: boolean;
  /** optional cancel/back handler */
  onCancel?: () => void;
}

/**
 * Modal dialog for creating or editing a CodeParent entry.
 */
const CodeParentModal: React.FC<Props> = ({
  values,
  onChange,
  onSubmit,
  isEditing,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-md">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? '대분류 코드 수정' : '대분류 코드 등록'}
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800"
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="pcode" className="block text-sm font-medium text-gray-700">
              코드
            </label>
            <input
              id="pcode"
              name="pcode"
              type="text"
              value={values.pcode}
              onChange={onChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="pcodeNm" className="block text-sm font-medium text-gray-700">
              코드명
            </label>
            <input
              id="pcodeNm"
              name="pcodeNm"
              type="text"
              value={values.pcodeNm}
              onChange={onChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="pcodeMemo" className="block text-sm font-medium text-gray-700">
              메모
            </label>
            <input
              id="pcodeMemo"
              name="pcodeMemo"
              type="text"
              value={values.pcodeMemo}
              onChange={onChange}
              placeholder="옵션"
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="pcodeSeqNo" className="block text-sm font-medium text-gray-700">
              순번
            </label>
            <input
              id="pcodeSeqNo"
              name="pcodeSeqNo"
              type="number"
              value={values.pcodeSeqNo}
              onChange={onChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${
                isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isEditing ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CodeParentModal;

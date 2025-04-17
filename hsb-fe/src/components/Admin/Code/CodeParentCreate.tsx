// src/components/Admin/Code/CodeParentCreate.tsx
import React from 'react';

export interface CodeParentCreateValues {
  pcode: string;
  pcodeNm: string;
  pcodeMemo?: string;
  pcodeSeqNo: number;
}

interface Props {
  values: CodeParentCreateValues;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const CodeParentCreate: React.FC<Props> = ({ values, onChange, onSubmit, isEditing, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded shadow-lg overflow-auto p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? '대분류 코드 수정' : '대분류 코드 등록'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">코드</label>
            <input
              name="pcode"
              value={values.pcode}
              onChange={onChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">코드명</label>
            <input
              name="pcodeNm"
              value={values.pcodeNm}
              onChange={onChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">메모</label>
            <input
              name="pcodeMemo"
              value={values.pcodeMemo || ''}
              onChange={onChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">순번</label>
            <input
              name="pcodeSeqNo"
              type="number"
              value={values.pcodeSeqNo}
              onChange={onChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditing ? '저장' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CodeParentCreate;

import React, { useEffect, useState } from 'react';
import { CorsOrigin, CorsOriginRequest } from '../types/CorsOrigin';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: CorsOriginRequest) => Promise<void>;
  editing?: CorsOrigin | null;
};

const ORIGIN_REGEX = /^(https?:\/\/)((\*\.)?[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+|localhost)(:\d{1,5})?$/;

export default function CorsOriginFormModal({ open, onClose, onSubmit, editing }: Props) {
  const [originPat, setOriginPat] = useState('');
  const [description, setDescription] = useState('');
  const [tenantId, setTenantId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editing) {
      setOriginPat(editing.originPat ?? '');
      setDescription(editing.description ?? '');
      setTenantId(editing.tenantId ?? '');
    } else {
      setOriginPat('');
      setDescription('');
      setTenantId('');
    }
    setError('');
  }, [editing, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!editing && !ORIGIN_REGEX.test(originPat.trim())) {
      setError('유효하지 않은 Origin 형식입니다. 예) https://www.hsbs.kr, https://*.example.com, http://localhost:5173');
      return;
    }
    const req: CorsOriginRequest = {
      originPat: originPat.trim() || undefined,       // 수정 시 빈값이면 미전송
      description: description.trim() || undefined,
      tenantId: tenantId.trim() || undefined,
    };
    await onSubmit(req);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-xl">
        <div className="text-lg font-semibold mb-4">{editing ? 'CORS Origin 수정' : 'CORS Origin 등록'}</div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Origin Pattern *</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={originPat}
              onChange={(e) => setOriginPat(e.target.value)}
              placeholder="https://*.example.com"
            />
            {editing && <p className="text-xs text-gray-500 mt-1">수정 시 비워두면 변경하지 않습니다.</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">설명</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메모용 설명"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tenant ID (선택)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="multi-tenant 환경에서만 사용"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>취소</button>
          <button className="px-4 py-2 rounded-lg bg-gray-900 text-white" onClick={handleSubmit}>
            {editing ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { BlockIp, BlockIpRequest } from '../types/BlockIp';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: BlockIpRequest) => Promise<void>;
  editing?: BlockIp | null;
};

const isRoughIpFormat = (value: string) => {
  const v = value.trim();
  if (!v) return false;
  if (v.length > 45) return false;
  if (!/^[0-9a-fA-F:.]+$/.test(v)) return false;
  return v.includes('.') || v.includes(':');
};

export default function BlockIpFormModal({ open, onClose, onSubmit, editing }: Props) {
  const [ipAddress, setIpAddress] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setIpAddress(editing.ipAddress ?? '');
      setDescription(editing.description ?? '');
    } else {
      setIpAddress('');
      setDescription('');
    }
    setError('');
  }, [editing, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!isRoughIpFormat(ipAddress)) {
      setError('유효한 IP 주소를 입력해주세요. (IPv4/IPv6)');
      return;
    }

    const req: BlockIpRequest = {
      ipAddress: ipAddress.trim(),
      description: description.trim() || undefined,
    };
    await onSubmit(req);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-xl">
        <div className="text-lg font-semibold mb-4">{editing ? 'Block IP 수정' : 'Block IP 등록'}</div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">IP 주소 *</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="203.0.113.10 또는 2001:db8::1"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">설명</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="차단 사유"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>
            취소
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-900 text-white" onClick={handleSubmit}>
            {editing ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}

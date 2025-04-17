// src/pages/Common/CodeDetailManagement.tsx
import React, { useEffect, useState, FormEvent } from 'react';
import {
  fetchCodeDetails,
  createCodeDetail,
  updateCodeDetail,
  deleteCodeDetail
} from '../../../services/Common/CodeApi';
import { CodeDetail } from '../../../types/Common/CodeDetail';

interface Props {
  pcode: string;
  onClose: () => void;
}

const CodeDetailManagement: React.FC<Props> = ({ pcode, onClose }) => {
  const [details, setDetails] = useState<CodeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    dcode: '',
    dcodeNm: '',
    dcodeExt: '',
    dcodeSeqNo: 1,
    useTf: 'Y' as 'Y' | 'N',
    delTf: 'N' as 'Y' | 'N'
  });
  const [editingNo, setEditingNo] = useState<number | null>(null);

  useEffect(() => {
    loadDetails();
  }, [pcode]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchCodeDetails(pcode);
      setDetails(data);
    } catch {
      setError('하위 코드 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'dcodeSeqNo' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingNo !== null) {
        await updateCodeDetail(pcode, editingNo, form);
      } else {
        await createCodeDetail(pcode, form);
      }
      setForm({ dcode:'', dcodeNm:'', dcodeExt:'', dcodeSeqNo:1, useTf:'Y', delTf:'N' });
      setEditingNo(null);
      loadDetails();
    } catch {
      setError('저장에 실패했습니다.');
    }
  };

  const startEdit = (d: CodeDetail) => {
    setEditingNo(d.dcodeNo);
    setForm({
      dcode: d.dcode,
      dcodeNm: d.dcodeNm,
      dcodeExt: d.dcodeExt ?? '',
      dcodeSeqNo: d.dcodeSeqNo,
      useTf: d.useTf,
      delTf: d.delTf
    });
  };

  const handleDelete = async (dno: number) => {
    try {
      await deleteCodeDetail(pcode, dno);
      loadDetails();
    } catch {
      setError('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white w-11/12 max-w-3xl rounded-lg shadow-lg overflow-auto max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{pcode} 하위 코드 관리</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-4">
          {loading ? <div>로딩 중...</div>
           : error ? <div className="text-red-500">{error}</div>
           : (
          <>
            <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-4 gap-2">
              <input name="dcode"    value={form.dcode}    onChange={handleChange} required placeholder="코드"    className="border px-2 py-1" />
              <input name="dcodeNm"  value={form.dcodeNm}  onChange={handleChange} required placeholder="코드명" className="border px-2 py-1" />
              <input name="dcodeExt" value={form.dcodeExt} onChange={handleChange} placeholder="추가정보" className="border px-2 py-1" />
              <input name="dcodeSeqNo" value={form.dcodeSeqNo} onChange={handleChange} type="number" required placeholder="순번" className="border px-2 py-1" />
              <button type="submit" className="col-span-4 bg-blue-600 text-white rounded py-1">
                {editingNo !== null ? '수정' : '등록'}
              </button>
            </form>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="border px-2 py-1">No</th>
                  <th className="border px-2 py-1">코드</th>
                  <th className="border px-2 py-1">코드명</th>
                  <th className="border px-2 py-1">추가정보</th>
                  <th className="border px-2 py-1">순번</th>
                  <th className="border px-2 py-1">액션</th>
                </tr>
              </thead>
              <tbody>
                {details.map(d => (
                  <tr key={d.dcodeNo}>
                    <td className="border px-2 py-1">{d.dcodeNo}</td>
                    <td className="border px-2 py-1">{d.dcode}</td>
                    <td className="border px-2 py-1">{d.dcodeNm}</td>
                    <td className="border px-2 py-1">{d.dcodeExt}</td>
                    <td className="border px-2 py-1">{d.dcodeSeqNo}</td>
                    <td className="border px-2 py-1 space-x-2">
                      <button onClick={() => startEdit(d)} className="text-blue-500">수정</button>
                      <button onClick={() => handleDelete(d.dcodeNo)} className="text-red-500">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeDetailManagement;

import React, { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import {
  fetchCodeDetails,
  createCodeDetail,
  updateCodeDetail,
  deleteCodeDetail
} from '../../../services/Common/CodeApi';
import { CodeDetail } from '../../../types/Common/CodeDetail';

const CodeDetailManagement: React.FC = () => {
  const { pcode } = useParams<{ pcode: string }>();
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
    if (pcode) loadDetails();
  }, [pcode]);

  const loadDetails = async () => {
    try {
      if (!pcode) return;
      const data = await fetchCodeDetails(pcode);
      setDetails(data);
    } catch {
      setError('하위 코드 목록을 불러오는데 실패했습니다.');
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
    if (!pcode) return;
    try {
      if (editingNo !== null) {
        await updateCodeDetail(pcode, editingNo, form);
      } else {
        await createCodeDetail(pcode, form);
      }
      setForm({
        dcode: '',
        dcodeNm: '',
        dcodeExt: '',
        dcodeSeqNo: 1,
        useTf: 'Y',
        delTf: 'N'
      });
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
      dcodeExt: d.dcodeExt || '',
      dcodeSeqNo: d.dcodeSeqNo,
      useTf: d.useTf,
      delTf: d.delTf
    });
  };

  const handleDelete = async (dno: number) => {
    if (!pcode) return;
    try {
      await deleteCodeDetail(pcode, dno);
      loadDetails();
    } catch {
      setError('삭제에 실패했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error)   return <div className="text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          {pcode} 하위 코드 관리
        </h1>

        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-4 gap-4">
          <input
            name="dcode"
            value={form.dcode}
            onChange={handleChange}
            required
            placeholder="코드"
            className="border px-2 py-1"
          />
          <input
            name="dcodeNm"
            value={form.dcodeNm}
            onChange={handleChange}
            required
            placeholder="코드명"
            className="border px-2 py-1"
          />
          <input
            name="dcodeExt"
            value={form.dcodeExt}
            onChange={handleChange}
            placeholder="추가정보"
            className="border px-2 py-1"
          />
          <input
            name="dcodeSeqNo"
            value={form.dcodeSeqNo}
            onChange={handleChange}
            type="number"
            required
            placeholder="순번"
            className="border px-2 py-1"
          />
          <button
            type="submit"
            className="col-span-4 bg-blue-600 text-white rounded py-2"
          >
            {editingNo !== null ? '수정' : '등록'}
          </button>
        </form>

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="border px-4 py-2">No</th>
              <th className="border px-4 py-2">코드</th>
              <th className="border px-4 py-2">코드명</th>
              <th className="border px-4 py-2">추가정보</th>
              <th className="border px-4 py-2">순번</th>
              <th className="border px-4 py-2">액션</th>
            </tr>
          </thead>
          <tbody>
            {details.map(d => (
              <tr key={d.dcodeNo}>
                <td className="border px-4 py-2">{d.dcodeNo}</td>
                <td className="border px-4 py-2">{d.dcode}</td>
                <td className="border px-4 py-2">{d.dcodeNm}</td>
                <td className="border px-4 py-2">{d.dcodeExt}</td>
                <td className="border px-4 py-2">{d.dcodeSeqNo}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => startEdit(d)}
                    className="text-blue-500"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(d.dcodeNo)}
                    className="text-red-500"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default CodeDetailManagement;

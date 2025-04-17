import React, { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import {
  fetchCodeParents,
  createCodeParent,
  updateCodeParent,
  deleteCodeParent
} from '../../../services/Common/CodeApi';
import { CodeParent } from '../../../types/Common/CodeParent';
import CodeDetailList from '../../../components/Admin/Code/CodeDetailList';

const CodeParentManagement: React.FC = () => {
  const [parents, setParents] = useState<CodeParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    pcode: '',
    pcodeNm: '',
    pcodeMemo: '',
    pcodeSeqNo: 1,
    useTf: 'Y' as 'Y' | 'N',
    delTf: 'N' as 'Y' | 'N',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPcode, setSelectedPcode] = useState<string>('');

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const data = await fetchCodeParents();
      setParents(data);
    } catch {
      setError('대분류 코드 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'pcodeSeqNo' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await updateCodeParent(editingId, form);
      } else {
        await createCodeParent(form);
      }
      setForm({
        pcode: '',
        pcodeNm: '',
        pcodeMemo: '',
        pcodeSeqNo: 1,
        useTf: 'Y',
        delTf: 'N',
      });
      setEditingId(null);
      loadParents();
    } catch {
      setError('저장에 실패했습니다.');
    }
  };

  const startEdit = (p: CodeParent) => {
    setEditingId(p.pcodeNo);
    setForm({
      pcode: p.pcode,
      pcodeNm: p.pcodeNm,
      pcodeMemo: p.pcodeMemo || '',
      pcodeSeqNo: p.pcodeSeqNo,
      useTf: p.useTf,
      delTf: p.delTf,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCodeParent(id);
      loadParents();
    } catch {
      setError('삭제에 실패했습니다.');
    }
  };

    const openDetails = (pcode: string) => {
        setSelectedPcode(pcode);
        setShowDetails(true);
    };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">대분류 코드 관리</h1>

        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-4 gap-4">
          <input
            name="pcode"
            value={form.pcode}
            onChange={handleChange}
            required
            placeholder="코드"
            className="border px-2 py-1"
          />
          <input
            name="pcodeNm"
            value={form.pcodeNm}
            onChange={handleChange}
            required
            placeholder="코드명"
            className="border px-2 py-1"
          />
          <input
            name="pcodeMemo"
            value={form.pcodeMemo}
            onChange={handleChange}
            placeholder="메모"
            className="border px-2 py-1"
          />
          <input
            name="pcodeSeqNo"
            value={form.pcodeSeqNo}
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
            {editingId !== null ? '수정' : '등록'}
          </button>
        </form>

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="border px-4 py-2">No</th>
              <th className="border px-4 py-2">코드</th>
              <th className="border px-4 py-2">코드명</th>
              <th className="border px-4 py-2">메모</th>
              <th className="border px-4 py-2">순번</th>
              <th className="border px-4 py-2">액션</th>
            </tr>
          </thead>
          <tbody>
            {parents.map(p => (
              <tr key={p.pcodeNo}>
                <td className="border px-4 py-2">{p.pcodeNo}</td>
                  <td className="border px-4 py-2">
               <button
                 onClick={() => openDetails(p.pcode)}
                 className="text-blue-600 hover:underline"
               >
                 {p.pcode}
               </button>
             </td>
             <td className="border px-4 py-2">
               <button
                 onClick={() => openDetails(p.pcode)}
                 className="text-blue-600 hover:underline"
               >
                 {p.pcodeNm}
               </button>
             </td>
                <td className="border px-4 py-2">{p.pcodeMemo}</td>
                <td className="border px-4 py-2">{p.pcodeSeqNo}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-blue-500"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(p.pcodeNo)}
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

    {showDetails && (
       <CodeDetailList
         pcode={selectedPcode}
         onClose={() => setShowDetails(false)}
      />
     )}
    </AdminLayout>
  );
};

export default CodeParentManagement;

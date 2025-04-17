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
import CodeParentCreate, { CodeParentCreateValues } from '../../../components/Admin/Code/CodeParentCreate';


const CodeParentManagement: React.FC = () => {
  const [parents, setParents] = useState<CodeParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPcode, setSelectedPcode] = useState<string>('');
  //팝업 제어
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState<CodeParentCreateValues>({
    pcode: '',
    pcodeNm: '',
    pcodeMemo: '',
    pcodeSeqNo: 1,
  });

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

  // “코드 등록” 버튼 누를 때
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ pcode: '', pcodeNm: '', pcodeMemo: '', pcodeSeqNo: 1 });
    setShowCreateModal(true);
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
      if (editingId != null) {
               await updateCodeParent(editingId, {
                ...form,
                 useTf: 'Y',
                 delTf: 'N'
               });
             } else {
                await createCodeParent({
                  ...form,
                  pcodeMemo: form.pcodeMemo || '',
                 pcodeSeqNo: form.pcodeSeqNo,
                });
              }
      setForm({
        pcode: '',
        pcodeNm: '',
        pcodeMemo: '',
        pcodeSeqNo: 1,
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
    });
    setShowCreateModal(true);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">대분류 코드 관리</h1>
        <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            코드 등록
          </button>
        </div>
  

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

 {/** 팝업 모달 영역 */}
 {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <CodeParentCreate
            values={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isEditing={editingId !== null}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      )}

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

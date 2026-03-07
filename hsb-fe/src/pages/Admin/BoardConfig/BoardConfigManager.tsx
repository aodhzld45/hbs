import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import Pagination from '../../../components/Common/Pagination';
import { BoardConfigItem } from '../../../types/Admin/BoardConfigItem';
import { deleteBoardConfig, fetchBoardConfigList, updateBoardConfigUseTf } from '../../../services/Admin/boardConfigApi';
import { useAuth } from '../../../context/AuthContext';

const BoardConfigManager: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [adminId, setAdminId] = useState<string | null>(admin?.id ?? null);
  const [items, setItems] = useState<BoardConfigItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAdminId(admin?.id ?? null);
  }, [admin?.id]);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchBoardConfigList(keyword, page, size);
      setItems(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error('게시판 설정 목록 조회 실패:', error);
      alert('게시판 설정 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [keyword, page, size]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleToggleUseTf = async (item: BoardConfigItem) => {
    if (!adminId) {
      alert('관리자 정보가 없습니다.');
      return;
    }
    try {
      await updateBoardConfigUseTf(item.id, item.useTf === 'Y' ? 'N' : 'Y', adminId);
      await loadList();
    } catch (error) {
      console.error('게시판 설정 사용 여부 변경 실패:', error);
      alert('사용 여부 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!adminId) {
      alert('관리자 정보가 없습니다.');
      return;
    }
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    try {
      await deleteBoardConfig(id, adminId);
      await loadList();
    } catch (error) {
      console.error('게시판 설정 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">게시판 설정관리</h2>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700">총 {totalCount}건</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  loadList();
                }
              }}
              placeholder="게시판명 또는 코드 검색"
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={() => {
                setPage(0);
                loadList();
              }}
              className="bg-gray-700 text-white px-4 rounded"
            >
              검색
            </button>
          </div>
        </div>

        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">코드</th>
              <th className="border p-2">게시판명</th>
              <th className="border p-2">스킨</th>
              <th className="border p-2">댓글</th>
              <th className="border p-2">파일</th>
              <th className="border p-2">공지</th>
              <th className="border p-2">카테고리</th>
              <th className="border p-2">사용 여부</th>
              <th className="border p-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">데이터를 불러오는 중입니다...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">등록된 게시판 설정이 없습니다.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{item.boardCode}</td>
                  <td className="border p-2 text-left">{item.boardName}</td>
                  <td className="border p-2">{item.skinType}</td>
                  <td className="border p-2">{item.commentTf}</td>
                  <td className="border p-2">{item.fileTf}</td>
                  <td className="border p-2">{item.noticeTf}</td>
                  <td className="border p-2">{item.categoryTf}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleToggleUseTf(item)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        item.useTf === 'Y' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {item.useTf === 'Y' ? '사용' : '미사용'}
                    </button>
                  </td>
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => navigate(`/admin/board-config/${item.id}/edit`)}
                      >
                        수정
                      </button>
                      <button
                        className="text-indigo-600 hover:underline"
                        onClick={() => navigate(`/admin/board/${item.boardCode}`)}
                      >
                        게시글
                      </button>
                      <button className="text-red-500 hover:underline" onClick={() => handleDelete(item.id)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <button onClick={() => navigate('/admin/board-config/write')} className="bg-blue-600 text-white px-4 py-2 rounded">
            등록
          </button>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </AdminLayout>
  );
};

export default BoardConfigManager;
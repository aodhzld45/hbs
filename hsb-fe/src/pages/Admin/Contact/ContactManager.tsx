import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactItem } from '../../../types/Common/ContactItem'; 
import AdminLayout from '../../../components/Layout/AdminLayout';
import { fetchContactList } from '../../../services/Common/ContactApi';
import Pagination from '../../../components/Common/Pagination';

const ContactManager = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [message, setMessage] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [contents, setContents] = useState<ContactItem[]>([]);

  const loadContacts = async (
    keyword: string,
    page: number,
    size: number
  ) => {
    try {
      const res = await fetchContactList(keyword, page, size);
      setContents(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setMessage(res.message);
    } catch (error) {
      console.error(error);
      alert('문의 관리 목록 조회 실패');
    }
  }

  useEffect(() => {
    loadContacts(keyword, page, size);
  }, []);


  return (
    <AdminLayout>
      <div className="p-6">

        <h2 className="text-2xl font-bold mb-4">문의 관리</h2>

        <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">총 {totalCount}개</span>
    
            <div className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      setPage(0);
                      loadContacts(keyword,page,size);
                  }
                }}
                placeholder="검색어 입력"
                className="border px-3 py-2 rounded"
              />
              <button
                onClick={() => {
                  setPage(0);
                  loadContacts(keyword,page,size);
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
                <th className="border p-2">No</th>
                <th className="border p-2">회사명</th>
                <th className="border p-2">담당자명</th>
                <th className="border p-2">문의제목</th>
                <th className="border p-2">첨부</th>
                <th className="border p-2">답변방법</th>
                <th className="border p-2">답변여부</th>
                <th className="border p-2">문의날짜</th>
              </tr>
              </thead>
              <tbody>
              {contents.length > 0 ? (
                contents.map((item, index) => (
                <tr key={item.id} className="text-center">
                  <td className="border p-2">{totalCount - (page * size + index)}</td> {/* 최신순 번호 부여 */}
                  <td
                    className="border p-2 text-left text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/contact/detail/${item.id}`)}
                  >
                    {item.companyName}
                  </td>
                  <td className="border p-2">{item.contactName}</td>
                  <td className="border p-2">{item.title}</td>

                  <td className="border p-2 text-center">
                    {item.filePath ? (
                    <span title="첨부파일 있음">📎</span>
                    ) : (
                      <span title="첨부 없음" className="text-red-500">✖</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {item.replyMethod === 'EMAIL' ? (
                      <span className="text-blue-600 font-semibold">이메일</span>
                    ) : item.replyMethod ==='SMS' ?(
                      <span className="text-blue-600 font-semibold">문자</span>
                    ) : (
                      <span className="text-blue-600 font-semibold">이메일 & 문자</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {item.replyTf === 'Y' ? (
                      <span className="text-green-600 font-semibold">답변완료</span>
                    ) : (
                      <span className="text-red-600">미답변</span>
                    )}
                  </td>
                  <td className="border p-2">{item.regDate?.slice(0, 10)}</td>
                </tr>
                ))
              ) : (
              <>
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-500">
                    등록된 문의가 없습니다.
                  </td>
                </tr>
              </>
              )}
              </tbody>
          </table>

          <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className='dark:text-gray-400'
          />
      </div>
    </AdminLayout>

  );
};

export default ContactManager;



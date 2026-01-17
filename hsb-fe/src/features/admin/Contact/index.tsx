import { useNavigate } from 'react-router-dom';
// 상태 값 및 API 호출 관련 import
import { useContactManager } from './hooks/useContactManager';
import AdminLayout from '../../../components/Layout/AdminLayout';
import Pagination from '../../../components/Common/Pagination';
// 공통검색 import
import SearchInput from '../Common/components/SearchInput';

const ContactManager = () => {
  const navigate = useNavigate();

  const {
    keyword,
    setKeyword,
    page,
    setPage,
    size,
    totalPages,
    totalCount,
    contents,
    loadContacts,
  } = useContactManager();

  return (
    <AdminLayout>
      <div className="p-6">

        <h2 className="text-2xl font-bold mb-4">문의 관리</h2>

        {/* 목록 Count 및 검색 필드 영역 */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700">총 {totalCount}개</span>
          <div className="flex gap-2">
            <SearchInput
              value={keyword}
              onChange={setKeyword}
              onSearch={() => {
                setPage(0);
                loadContacts(keyword, 0, size);
              }}
            />
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

          {/* 페이징 영역  */}
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



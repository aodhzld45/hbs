import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContactItem } from '../../../types/Common/ContactItem';
import { fetchContactDetail, fetchContactReply } from '../../../services/Common/ContactApi';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { FILE_BASE_URL } from '../../../config/config';

const ContactDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contents, setContents] = useState<ContactItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [replyMethod, setReplyMethod] = useState('EMAIL');
    const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchContactDetail(Number(id));
        setContents(data);
      } catch (error) {
        alert('문의글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadDetail();
  }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (!contents) return <div>문의글이 존재하지 않습니다.</div>;


  const handleSubmit = async () => {

    if (!reply.trim()) {
      alert('답변 내용을 입력해주세요.');
      replyRef.current?.focus(); // 포커스
      return;
    }

    try {
      const res = await fetchContactReply({
        id: Number(id),
        replyContent: reply,
        replyMethod,
      });

      if (res && res.message) {
        alert(res.message);
        navigate('/admin/contact'); // 목록으로 리다이렉트
      } else {
        alert("답변이 정상적으로 처리되었습니다.");
        navigate('/admin/contact'); // 목록으로 리다이렉트
      }

    } catch (error) {
      alert('답변 저장에 실패했습니다.');
      console.error(error);
    }
  };
  

  return (
  <AdminLayout>
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
        <h2 className="text-2xl font-bold mb-6">문의 상세</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div><strong>회사명:</strong> {contents.companyName}</div>
            <div><strong>담당자명:</strong> {contents.contactName}</div>
            <div><strong>이메일:</strong> {contents.email}</div>
            <div><strong>연락처:</strong> {contents.phone}</div>
            <div><strong>프로젝트 유형:</strong> {contents.projectType}</div>
            <div><strong>문의일:</strong> {contents.regDate?.slice(0, 10)}</div>
        </div>

        <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">문의 제목</h3>
        <p className="border p-3 rounded bg-gray-50">{contents.title}</p>
        </div>

        <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">문의 내용</h3>
        <p className="border p-3 rounded bg-gray-50 whitespace-pre-wrap">{contents.message}</p>
        </div>

        {contents.filePath && (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">첨부파일</h3>
            <a
              href={`${FILE_BASE_URL}/api/file/download?filePath=${encodeURIComponent(contents.filePath)}&originalName=${encodeURIComponent(contents.originalFileName ?? '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {contents.originalFileName}
            </a>
        </div>
        )}

        <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">답변 방법</h3>
        <select
            value={replyMethod}
            onChange={(e) => setReplyMethod(e.target.value)}
            className="border p-2 rounded"
        >
            <option value="EMAIL">이메일</option>
            <option value="PHONE">유선</option>
        </select>
        </div>

        <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">답변 내용</h3>
        <textarea
            ref={replyRef}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={6}
            className="w-full border p-3 rounded resize-none"
        />
        </div>

        <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            답변 저장 및 메일 발송
        </button>

        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate(`/admin/contact`)}
            className="bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-700"
          >
            목록으로
          </button>
        </div>
    </div>
  </AdminLayout>
  )
}

export default ContactDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { fetchHbsDetail } from '../../../services/hbsApi';
import { fetchHbsUpdate } from '../../../services/hbsApi';
import { fetchHbsDelete } from '../../../services/hbsApi';

import { HbsContent } from '../../../types/HbsContent';
import { FILE_BASE_URL } from '../../../config/config';

import AdminLayout from '../../../components/Layout/AdminLayout';
import EditContentModal from '../Hbs/EditContentModal';

// 에디터용 import
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const ContentManagerDetail = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<HbsContent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (fileId) {
      fetchHbsDetail(Number(fileId)).then(setContent).catch(console.error);
    }
  }, [fileId]);

  if (!content) return <div>로딩 중...</div>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">콘텐츠 관리</h2>

        {/* 썸네일 or 파일명 표시 */}
        {content.contentType === 'HBS' && content.thumbnailUrl ? (
        <img
            // UploadPath 활용
            src={`${FILE_BASE_URL}${content.thumbnailUrl}`}
            // aws s3 활용
            //src={`${content.thumbnailUrl}`}
            alt={content.title}
            className="w-full h-40 object-cover"
        />
        ) : content.fileType === 'LINK' && content.contentType === 'YOUTUBE' ? (
          <iframe
          width="100%"
          height="360"
          src={content.fileUrl}
          title={content.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          ></iframe>
        ) :
        (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center px-2 text-sm text-gray-700 text-center">
            등록된 파일명:<br />
            <strong>📄{content.fileUrl.split('/').pop()}</strong>
        </div>
        )}

        {content.fileType === 'VIDEO' && (
          <video
            // UploadPath 활용
            src={`${FILE_BASE_URL}${content.fileUrl}`}
            // aws s3 활용
            //src={`${content.fileUrl}`}
            controls
            className="w-full mt-4 rounded shadow-lg"
          />
        )}

        <h3 className="text-xl font-semibold mt-4">{content.title}</h3>
        <p className="text-gray-700">{content.description}</p>
        {/* 에디터 저장된 HTML 콘텐츠 표시 */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content || '' }}
          ></div>

        <p className="text-sm text-gray-500 mt-2">
          등록일: {new Date(content.regDate).toISOString().slice(0, 16).replace('T', ' ')}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={() => setShowEditModal(true)}
          >
            수정
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={async () => {
                if (window.confirm('정말 삭제하시겠습니까?')) {
                try {
                    await fetchHbsDelete(content.fileId);
                    alert('콘텐츠가 삭제 되었습니다.');
                    navigate('/admin/content-manager'); // 목록으로 이동
                } catch (err) {
                    console.error(err);
                    alert('삭제 실패');
                }
                }
            }}
            >
            삭제
            </button>

          <button
            className="ml-auto px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => navigate('/admin/content-manager')}
          >
            목록으로
          </button>
        </div>
      </div>

      {showEditModal && content && (
        <EditContentModal
            content={content}
            onClose={() => setShowEditModal(false)}
            onSave={async (updatedFormData) => {
                try {
                const updated = await fetchHbsUpdate(updatedFormData);
                setContent(updated); // 수정 후 화면 즉시 반영
                alert('콘텐츠가 수정되었습니다!');
                } catch (err) {
                console.error(err);
                alert('수정 실패');
                }
            }}
            />
        )}
      
    </AdminLayout>
  );
};

export default ContentManagerDetail;

// src/pages/hbs/HbsDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchHbsDetail } from '../../../services/hbsApi'
import { HbsContent } from '../../../types/HbsContent';
import { FILE_BASE_URL } from '../../../config/config';
import Layout from '../../../components/Layout/Layout';



const HbsDetailPage = () => {
    const { fileId } = useParams<{ fileId: string }>();
    const [content, setContent] = useState<HbsContent | null>(null);

    useEffect(() => {
        if (fileId) {
          fetchHbsDetail(Number(fileId)).then(setContent).catch(console.error);
        }
      }, [fileId]);

    if (!content) return <div>로딩 중...</div>;


    return (
        <Layout>
          <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white rounded shadow">
            <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
            <p className="text-gray-600 mb-6">{content.description}</p>

            {/* YouTube 링크인 경우 */}
            {content.fileType === 'LINK' && content.contentType === 'YOUTUBE' ? (
              <iframe
                width="100%"
                height="360"
                src={content.fileUrl}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full rounded shadow-md"
              ></iframe>
            ) : content.contentType === 'HBS' && content.thumbnailUrl ? (
              // HBS 콘텐츠이면서 썸네일이 있는 경우
              <img
                src={`${FILE_BASE_URL}${content.thumbnailUrl}`}
                // aws s3 활용
                //src={`${content.thumbnailUrl}`}
                alt={content.title}
                className="w-full h-40 object-cover rounded"
              />
            ) : (
              // 썸네일 없고 일반 파일인 경우
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center px-2 text-sm text-gray-700 text-center rounded">
                등록된 파일명:<br />
                <strong>{content.fileUrl.split('/').pop()}</strong>
              </div>
            )}

            {/* VIDEO 파일 타입인 경우만 비디오 출력 */}
            {content.fileType === 'VIDEO' && (
              <video
                src={`${FILE_BASE_URL}${content.fileUrl}`}
                controls
                className="w-full mt-4 rounded shadow-lg border"
              />
            )}

            {/* 에디터 본문 내용 */}
            <div
              className="prose prose-lg max-w-none mt-6"
              dangerouslySetInnerHTML={{ __html: content.content || '' }}
            ></div>

            {/* 등록일 */}
            <div className="mt-6 text-sm text-gray-400">
              등록일: {new Date(content.regDate).toISOString().slice(0, 16).replace('T', ' ')}
            </div>
          </div>

            
      </Layout>
    );
}

export default HbsDetailPage;
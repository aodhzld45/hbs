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

                <video
                //src={`${FILE_BASE_URL}${content.fileUrl}`}
                src={`${content.fileUrl}`}
                controls
                className="w-full rounded-lg shadow-lg border"
                />

                <div className="mt-6 text-sm text-gray-400">
                    등록일: {new Date(content.regDate).toISOString().slice(0, 16).replace('T', ' ')}
                </div>
            </div>
      </Layout>
    );
}

export default HbsDetailPage;
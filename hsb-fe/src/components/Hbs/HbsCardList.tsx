import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import HbsCard from './HbsCard';
import Layout from '../Layout/Layout';
import { fetchHbsList, fetchFilteredContents } from '../../services/hbsApi';
import { HbsContent } from '../../types/HbsContent';
import api from '../../services/api';



const HbsCardList = () => {
  const [contents, setContents] = useState<HbsContent[]>([]);

  const { fileType, contentType } = useParams<{ fileType?: string; contentType?: string }>();

  const safeFileType = fileType?.toUpperCase() ?? '';
  const safeContentType = contentType?.toUpperCase() ?? '';

  useEffect(() => {
    const loadContents = async () => {
      try {
        const data = await fetchFilteredContents(safeFileType, safeContentType);
        setContents(data);
      } catch (e) {
        console.error(e);
        alert('콘텐츠 로드 실패');
      }
    };
  
    loadContents();
  }, [safeFileType, safeContentType]);


  // useEffect(() => {
  //   const loadContents = async () => {
  //     try {
  //       const data = await fetchHbsList();
  //       setContents(data);
  //     } catch (error) {
  //       console.error('콘텐츠 불러오기 실패:', error);
  //     }
  //   };

  //   loadContents();
  // }, []);

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">HBS 목록 4356</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* {contents.map((content) => (
            <HbsCard key={content.fileId} content={content} />
          ))} */}
        </div>
      </div>
    </Layout>
  );
};


export default HbsCardList;

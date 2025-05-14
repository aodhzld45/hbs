import React, { useEffect, useState } from 'react';
import HbsCard from './HbsCard';
import Layout from '../Layout/Layout';
import { fetchHbsList } from '../../services/hbsApi';
import { HbsContent } from '../../types/HbsContent';


const HbsCardList = () => {
  const [contents, setContents] = useState<HbsContent[]>([]);

  useEffect(() => {
    const loadContents = async () => {
      try {
        const data = await fetchHbsList();
        setContents(data);
        console.log(data);


      } catch (error) {
        console.error('콘텐츠 불러오기 실패:', error);
      }
    };

    loadContents();
  }, []);

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">HBS 목록</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contents.map((content) => (
            <HbsCard key={content.fileId} content={content} />
          ))}
        </div>
      </div>
    </Layout>
  );
};


export default HbsCardList;

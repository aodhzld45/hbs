import React from 'react';
import HbsCard from './HbsCard';
import { dummyContents } from './dummyContent';
import Layout from '../Layout/Layout';

const HbsCardList = () => {
  return (
    <Layout>
    <div className="p-6 bg-gray-50 min-h-screen">

      <h2 className="text-2xl font-bold mb-6">홍보 콘텐츠 리스트</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dummyContents.map((content) => (
          <HbsCard key={content.fileId} content={content} />
        ))}
      </div>
    </div>
    </Layout>
  );
};

export default HbsCardList;

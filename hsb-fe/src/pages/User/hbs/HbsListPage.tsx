// src/pages/hbs/HbsListPage.tsx
import { useEffect, useState } from 'react';
import { fetchHbsList } from '../../../services/hbsApi';
import { HbsContent } from '../../../types/HbsContent';
import HbsCardList from '../../../components/Hbs/HbsCardList';

const HbsListPage = () => {
  const [contents, setContents] = useState<HbsContent[]>([]);

//   useEffect(() => {
//     fetchHbsList().then(setContents);
//   }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🎬 HBS 콘텐츠 목록</h1>
      {/* <HbsCardList contents={contents} /> */}
    </div>
  );
};

export default HbsListPage;

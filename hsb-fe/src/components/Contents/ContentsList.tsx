import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ContentsCard from './ContentsCard';
import Layout from '../Layout/Layout';
import { fetchHbsList, fetchFilteredContents } from '../../services/hbsApi';
import { HbsContent, ContentTypeTitleMap, ContentType, FileType } from '../../types/HbsContent';
import api from '../../services/api';

const ContentsList = () => {
  const [contents, setContents] = useState<HbsContent[]>([]);

  const { fileType, contentType } = useParams<{ fileType?: string; contentType?: string }>();

  const safeFileType = fileType?.toUpperCase() ?? '' as FileType;
  const safeContentType = contentType?.toUpperCase() ?? '' as ContentType;

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

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8 dark:text-gray-400"> {ContentTypeTitleMap[safeContentType as ContentType]}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contents.map((content) => (
            <ContentsCard key={content.fileId} content={content} fileType={fileType as FileType} contentType={contentType as ContentType} />
          ))}
        </div>
      </div>
    </Layout>
  );
};


export default ContentsList;

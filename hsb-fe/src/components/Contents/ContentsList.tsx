import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ContentsCard from './ContentsCard';
import Layout from '../Layout/Layout';
import { fetchFilteredContents } from '../../services/hbsApi';
import { HbsContent, ContentTypeTitleMap, ContentType, FileType } from '../../types/HbsContent';
import Pagination from '../Common/Pagination';

const ContentsList = () => {
  const [contents, setContents] = useState<HbsContent[]>([]);
  const { fileType, contentType } = useParams<{ fileType?: string; contentType?: string }>();
  const safeFileType = fileType?.toUpperCase() ?? '' as FileType;
  const safeContentType = contentType?.toUpperCase() ?? '' as ContentType;
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadContents = async () => {
    try {
      const res = await fetchFilteredContents(safeFileType, safeContentType, keyword, page, size);
      setContents(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
      alert('콘텐츠 로드 실패');
    }
  };

  useEffect(() => {
    setPage(0);
  }, [safeFileType, safeContentType]);

  useEffect(() => {
    loadContents();
  }, [safeFileType, safeContentType, page]);

  return (
    <Layout>
      <div className="w-full max-w-screen-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 dark:text-gray-400"> {ContentTypeTitleMap[safeContentType as ContentType]}</h1>
        <div className="flex justify-between mb-4">
          {/* 총 게시글 수 */}
          <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">전체 {totalCount}건</span>
          </div>
          {/* 검색 영역 */}
          <div className="flex gap-2">
            <select className="border px-3 py-2 rounded text-sm">
              <option>콘텐츠명</option>
            </select>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setPage(0);
                                loadContents();
                            }
                        }}
                        placeholder="검색어를 입력해주세요."
                        className="border px-3 py-2 rounded text-sm"
                    />
                    <button
                    onClick={() => {
                        setPage(0);
                        loadContents();
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded text-sm"
                    >
                    검색
                    </button>
                </div>
          {/* 검색 영역 */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contents.map((content) => (
            <ContentsCard key={content.fileId} content={content} fileType={fileType as FileType} contentType={contentType as ContentType} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="dark:text-gray-400"
          />
        </div>
      </div>
    </Layout>
  );
};


export default ContentsList;

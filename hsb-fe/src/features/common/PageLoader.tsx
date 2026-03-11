import React from 'react';

interface PageLoaderProps {
  message?: string;
  minHeight?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = '데이터를 불러오는 중입니다.',
  minHeight = '400px',
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ minHeight }}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};

export default PageLoader;
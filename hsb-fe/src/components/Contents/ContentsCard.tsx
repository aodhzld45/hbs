import React, { useEffect, useState } from 'react';
import { ContentType, FileType, HbsContent } from '../../types/Contents/HbsContent';
import { useNavigate } from 'react-router-dom';
import { FILE_BASE_URL } from '../../config/config';
import Pagination from '../Common/Pagination';


interface Props {
  fileType : FileType;
  contentType : ContentType;
  content: HbsContent;
}

const ContentsCard = ({ content, fileType, contentType }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/${fileType}/${contentType}/detail/${content.fileId}`)}
      className="cursor-pointer shadow-md rounded overflow-hidden hover:scale-105 transition-transform bg-white"
    >
      <div className="relative">
      {content.fileType === 'LINK' && content.contentType === 'YOUTUBE' ? (
        <img
        src={`${content.thumbnailUrl}`}
        // aws s3 활용
        //src={`${content.thumbnailUrl}`}
        alt={content.title}
        className="w-full h-48 object-cover"
      />
      ) : (
        <img
        src={`${FILE_BASE_URL}${content.thumbnailUrl}`}
        // aws s3 활용
        //src={`${content.thumbnailUrl}`}
        alt={content.title}
        className="w-full h-48 object-cover"
      />
      )}

        <div className="absolute inset-0 flex justify-center items-center">
          <img src="/play.png" alt="Play" className="w-12 opacity-75" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold">{content.title}</h3>

        {/* 작성일 + 조회수 수평 정렬 */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
          <span>등록일 : 📅 {content.regDate?.slice(0, 10)}</span>
          <span>👁️ 조회수 {content.viewCount?.toLocaleString()}회</span>
        </div>
      </div>
    </div>
  );
};

export default ContentsCard;

import React from 'react';
import { HbsContent } from '../../types/HbsContent';
import { useNavigate } from 'react-router-dom';
import { FILE_BASE_URL } from '../../config/config';


interface Props {
  content: HbsContent;
}

const HbsCard = ({ content }: Props) => {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate(`/content-files/${content.fileId}`)}
      className="cursor-pointer shadow-md rounded overflow-hidden hover:scale-105 transition-transform bg-white"
    >
      <div className="relative">
        <img
          //src={`${FILE_BASE_URL}${item.thumbnailUrl}`}
          src={content.thumbnailUrl}
          alt={content.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 flex justify-center items-center">
          <img src="/play.png" alt="Play" className="w-12 opacity-75" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold">{content.title}</h3>
        <p className="text-sm text-gray-500">{content.regDate?.slice(0,10)}</p>
      </div>
    </div>
  );
};

export default HbsCard;

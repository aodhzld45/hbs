import { useState } from 'react';
import { FileType, ContentType, HbsContent } from '../../../../types/Contents/HbsContent';

export const useContentManagerState = () => {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState<FileType>('VIDEO');
  const [contentType, setContentType] = useState<ContentType>('HBS');
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [contents, setContents] = useState<HbsContent[]>([]);

  const [filterFileType, setFilterFileType] = useState<FileType | ''>('');
  const [filterContentType, setFilterContentType] = useState<ContentType | ''>('');
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [youtubeId, setYoutubeId] = useState('');
  const [youtubeImgUrl, setYoutubeImgUrl] = useState('');
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState('');

  return {
    keyword, setKeyword,
    page, setPage,
    size,
    totalPages, setTotalPages,
    totalCount, setTotalCount,
    title, setTitle,
    description, setDescription,
    content, setContent,
    fileType, setFileType,
    contentType, setContentType,
    mainFile, setMainFile,
    thumbnailFile, setThumbnailFile,
    fileUrl, setFileUrl,
    contents, setContents,
    filterFileType, setFilterFileType,
    filterContentType, setFilterContentType,
    youtubeId, setYoutubeId,
    youtubeImgUrl, setYoutubeImgUrl,
    youtubeEmbedUrl, setYoutubeEmbedUrl,
  };
};

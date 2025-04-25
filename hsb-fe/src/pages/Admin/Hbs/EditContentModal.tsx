import React, { useState, useEffect } from 'react';
import { HbsContent, FileType, ContentType } from '../../../types/HbsContent';
import { FILE_BASE_URL } from '../../../config/config';


// 에디터용 import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface EditContentModalProps {
  content: HbsContent;
  onClose: () => void;
  onSave: (updated: FormData) => void;
}

const EditContentModal = ({ content, onClose, onSave }: EditContentModalProps) => {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description);
  const [fileType, setFileType] = useState<FileType>(content.fileType);
  const [contentType, setContentType] = useState<ContentType>(content.contentType);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState(content.fileUrl || '');
  const [editorContent, setEditorContent] = useState<string>(content.content || '');

    // 유튜브용 상태
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [youtubeId, setYoutubeId] = useState('');
  const [youtubeImgUrl, setYoutubeImgUrl] = useState('');
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(content.fileUrl || '');

  useEffect(() => {
    if (fileType === 'LINK' && content.contentType === 'YOUTUBE' && content.fileUrl) {
      extractYoutubeInfo(content.fileUrl);
    }
  }, [fileType, content]);

  const extractYoutubeInfo = (url: string) => {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/;
    const match = url.match(regex);
    const id = match?.[1];
    if (!id) {
      alert('Youtube URL이 유효하지 않습니다.');
      return;
    }
    setYoutubeId(id);
    setYoutubeImgUrl(`http://img.youtube.com/vi/${id}/mqdefault.jpg`);
    setYoutubeEmbedUrl(`https://www.youtube.com/embed/${id}`);
  };

  const handleFileTypeChange = (type: FileType) => {
    setFileType(type);
    setContentType(type === 'LINK' ? 'YOUTUBE' : 'HBS');
  };

  const handleSubmit = () => {
    const htmlContent = editorContent;

    const formData = new FormData();
    formData.append('fileId', String(content.fileId));
    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', htmlContent);
    formData.append('fileType', fileType);
    formData.append('contentType', contentType);

    if (fileType === 'LINK') {
      formData.append('fileUrl', youtubeEmbedUrl);
      formData.append('thumbnailUrl', youtubeImgUrl);
    } else {
      if (mainFile) formData.append('file', mainFile);
      if (fileType === 'VIDEO' && thumbnailFile) formData.append('thumbnail', thumbnailFile);
    }

    onSave(formData);
    onClose();
  };

  const getOriginalFilename = (filename: string) => {
    const parts = filename.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : filename;
  };
  
  // 파일명 추출 및 정제
  const fileName = getOriginalFilename(content.fileUrl?.split('/').pop() || '');
  const thumbnailFileName = getOriginalFilename(content.thumbnailUrl?.split('/').pop() || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-[90%] sm:max-w-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">콘텐츠 수정</h2>
  
        <label className="block mb-2 text-sm font-medium">제목</label>
        <input
          type="text"
          className="w-full border p-2 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
  
        <label className="block mb-2 text-sm font-medium">설명</label>
        <textarea
          className="w-full border p-2 mb-4"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
  
        <div className="mb-4">
          <label className="block text-sm font-medium">파일 타입</label>
          <select
            value={fileType}
            onChange={(e) => handleFileTypeChange(e.target.value as FileType)}
            className="w-full border p-2"
          >
            <option value="VIDEO">VIDEO</option>
            <option value="IMAGE">IMAGE</option>
            <option value="DOCUMENT">DOCUMENT</option>
            <option value="LINK">LINK</option>
          </select>
        </div>
  
        <div className="mb-4">
          <label className="block text-sm font-medium">콘텐츠 타입</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full border p-2 rounded"
          >
            {fileType === 'LINK' ? (
              <option value="YOUTUBE">YOUTUBE</option>
            ) : (
              <>
                <option value="HBS">HBS</option>
                <option value="PROMO">PROMO</option>
                <option value="MEDIA">MEDIA</option>
                <option value="CI_BI">CI_BI</option>
              </>
            )}
          </select>
        </div>
  
        <div className="mb-4">
          <label className="block text-sm font-medium">본문 콘텐츠</label>
          <div className="editor-wrapper max-w-full overflow-x-auto">
            <CKEditor
              editor={ClassicEditor}
              data={editorContent}
              onChange={(event: any, editor: any) => {
                const data = editor.getData();
                setEditorContent(data);
              }}
            />
          </div>
        </div>
  
        {fileType === 'LINK' ? (
          <div className="mb-4">
            <label className="block font-semibold mb-1">유튜브 URL</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=xxxx 또는 https://youtu.be/xxxx"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              onBlur={() => extractYoutubeInfo(fileUrl)}
              className="w-full border px-4 py-2 rounded"
              required
            />
            {youtubeImgUrl && (
              <div className="mt-4 flex gap-4 items-center">
                <img
                  src={youtubeImgUrl}
                  width={150}
                  height={100}
                  alt="썸네일"
                  className="rounded border"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              {fileType === 'VIDEO'
                ? '영상 파일 (mp4)'
                : fileType === 'IMAGE'
                ? '이미지 파일'
                : '문서 파일'}
            </label>
            <input
              type="file"
              accept={
                fileType === 'VIDEO'
                  ? 'video/mp4'
                  : fileType === 'IMAGE'
                  ? 'image/*'
                  : '.pdf,.doc,.docx,.hwp'
              }
              onChange={(e) => setMainFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-gray-600 mt-1">
              기존 파일명: <strong>{fileName || '없음'}</strong>
            </p>
          </div>
        )}
  
        {fileType === 'VIDEO' && (
          <div className="mb-4">
            <label className="block text-sm font-medium">썸네일 이미지 (선택)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
            {thumbnailFile ? (
              <p className="text-sm text-gray-600 mt-1">{thumbnailFileName}</p>
            ) : (
              content.thumbnailUrl && (
                <img
                  src={`${FILE_BASE_URL}${content.thumbnailUrl}`}
                  alt="기존 썸네일"
                  className="mt-2 h-24 rounded border"
                />
              )
            )}
          </div>
        )}
  
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default EditContentModal;
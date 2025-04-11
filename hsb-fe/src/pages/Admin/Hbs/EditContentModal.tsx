import React, { useState } from 'react';
import { HbsContent, FileType, ContentType } from '../../../types/HbsContent';
import { FILE_BASE_URL } from '../../../config/config';

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
  
    const handleSubmit = () => {
      const formData = new FormData();
      formData.append('fileId', String(content.fileId));
      formData.append('title', title);
      formData.append('description', description);
      formData.append('fileType', fileType);
      formData.append('contentType', contentType);
      if (mainFile) formData.append('file', mainFile);
      if (fileType === 'VIDEO' && thumbnailFile) formData.append('thumbnail', thumbnailFile);
      onSave(formData);
      onClose();
    };
  
    const fileName = content.fileUrl?.split('/').pop();
    const thumbnailFileName = content.thumbnailUrl?.split('/').pop();
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">콘텐츠 수정</h2>
  
          {/* 제목 */}
          <label className="block mb-2 text-sm font-medium">제목</label>
          <input
            type="text"
            className="w-full border p-2 mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
  
          {/* 설명 */}
          <label className="block mb-2 text-sm font-medium">설명</label>
          <textarea
            className="w-full border p-2 mb-4"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
  
          {/* 파일 타입 */}
          <div className="mb-4">
            <label className="block text-sm font-medium">파일 타입</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as FileType)}
              className="w-full border p-2"
            >
              <option value="VIDEO">VIDEO</option>
              <option value="IMAGE">IMAGE</option>
              <option value="DOCUMENT">DOCUMENT</option>
            </select>
          </div>
  
          {/* 콘텐츠 타입 */}
          <div className="mb-4">
            <label className="block text-sm font-medium">콘텐츠 타입</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full border p-2"
            >
              <option value="HBS">HBS</option>
              <option value="PROMO">PROMO</option>
              <option value="MEDIA">MEDIA</option>
              <option value="CI_BI">CI_BI</option>
            </select>
          </div>
  
          {/* 영상/이미지/문서 업로드 */}
          <div className="mb-4">
            <label className="block text-sm font-medium">
              {fileType === 'VIDEO'
                ? '새 영상 파일 (선택)'
                : fileType === 'IMAGE'
                ? '새 이미지 파일 (선택)'
                : '새 문서 파일 (선택)'}
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
              기존 파일명: <strong>{fileName}</strong>
            </p>
          </div>
  
          {/* 썸네일 파일 선택 및 기존 썸네일 */}
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
  
          {/* 버튼 */}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
              취소
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
              저장
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default EditContentModal;

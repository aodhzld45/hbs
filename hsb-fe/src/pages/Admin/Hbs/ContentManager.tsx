import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import api from '../../../services/api';
import { FileType, ContentType, HbsContent } from '../../../types/HbsContent';
import { FILE_BASE_URL } from '../../../config/config';
import { useNavigate } from 'react-router-dom';
import { fetchHbsCreate } from '../../../services/hbsApi';

function ContentManager() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<FileType>('VIDEO');
  const [contentType, setContentType] = useState<ContentType>('HBS');
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [contents, setContents] = useState<HbsContent[]>([]);

  const [youtubeId, setYoutubeId] = useState('');
  const [youtubeImgUrl, setYoutubeImgUrl] = useState('');
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState('');

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

  const loadContents = async () => {
    try {
      const res = await api.get('/content-files');
      setContents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) return alert('제목과 설명을 입력해주세요.');

    if (fileType === 'LINK') {
      if (!fileUrl || !youtubeEmbedUrl) return alert('유튜브 링크를 입력해주세요.');
    } else {
      if (!mainFile || (fileType === 'VIDEO' && !thumbnailFile)) return alert('필수 파일을 선택해주세요.');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('fileType', fileType);
    formData.append('contentType', contentType);

    if (fileType === 'LINK') {
      formData.append('fileUrl', youtubeEmbedUrl);
      formData.append('thumbnailUrl', youtubeImgUrl);
    } else {
      formData.append('file', mainFile as Blob);
      if (fileType === 'VIDEO') formData.append('thumbnail', thumbnailFile as Blob);
    }

    try {
      await fetchHbsCreate(formData);
      alert('등록 완료');
      setTitle('');
      setDescription('');
      setMainFile(null);
      setThumbnailFile(null);
      setFileUrl('');
      setYoutubeEmbedUrl('');
      setYoutubeImgUrl('');
      setYoutubeId('');
      loadContents();
    } catch (err) {
      console.error(err);
      alert('등록 실패');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-4">콘텐츠 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">파일 타입</label>
              <select
                value={fileType}
                onChange={e => handleFileTypeChange(e.target.value as FileType)}
                className="w-full border p-2 rounded"
              >
                <option value="VIDEO">VIDEO</option>
                <option value="IMAGE">IMAGE</option>
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="LINK">LINK</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold">콘텐츠 유형</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value as ContentType)}
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
          </div>

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목"
            required
            className="w-full border px-4 py-2 rounded"
          />

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="설명"
            className="w-full border px-4 py-2 rounded"
          />

          {fileType === 'LINK' ? (
            <div>
              <label className="block font-semibold mb-1">유튜브 URL</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=xxxx 또는 https://youtu.be/xxxx"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                onBlur={() => extractYoutubeInfo(fileUrl)}
                className="w-full border px-4 py-2 rounded"
                required
              />
              {youtubeImgUrl && (
                <div className="mt-4 flex gap-4 items-center">
                  <img src={youtubeImgUrl} width={150} height={100} alt="썸네일" className="rounded border" />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block font-semibold mb-1">
                {fileType === 'VIDEO' ? '영상 파일 (mp4)' : fileType === 'IMAGE' ? '이미지 파일' : '문서 파일'}
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
                onChange={e => setMainFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          )}

          {fileType === 'VIDEO' && (
            <div>
              <label className="block font-semibold mb-1">썸네일 이미지</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          )}

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            등록하기
          </button>
        </form>
      </div>

      {/* ▼ 등록된 콘텐츠 미리보기 영역 */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl font-bold mb-4">등록된 콘텐츠</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contents.map((item) => (
            <div
              key={item.fileId}
              onClick={() => navigate(`/admin/hbs/${item.fileId}`)}
              className="cursor-pointer border rounded overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* 콘텐츠 타입별 미리보기 */}
              {item.fileType === 'LINK' && item.contentType === 'YOUTUBE' ? (
                <iframe
                  width="100%"
                  height="200"
                  src={item.fileUrl}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              ) : item.contentType === 'HBS' && item.thumbnailUrl ? (
                <img
                  src={`${FILE_BASE_URL}${item.thumbnailUrl}`}
                  
                  alt={item.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center px-2 text-sm text-gray-700 text-center">
                  등록된 파일명:<br />
                  <strong>{item.fileUrl?.split('/').pop()}</strong>
                </div>
              )}

              <div className="p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-500">{item.regDate?.slice(0, 10)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ContentManager;
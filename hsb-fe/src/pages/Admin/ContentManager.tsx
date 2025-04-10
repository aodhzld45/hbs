import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import api from '../../services/api';
import { FileType, ContentType, HbsContent } from '../../types/HbsContent';
import { FILE_BASE_URL } from '../../config/config';


function ContentManager() {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<FileType>('VIDEO');
  const [contentType, setContentType] = useState<ContentType>('HBS');
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [contents, setContents] = useState<HbsContent[]>([]);

  // 콘텐츠 목록 불러오기 - 등록 후 다시 불러오기 위함 쩝...
  const loadContents = async () => {
    try {
      const res = await api.get('/content-files'); // 필요한 경우 필터링 추가
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

    if (!mainFile || (fileType === 'VIDEO' && !thumbnailFile)) {
      alert('필수 파일을 모두 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('fileType', fileType);
    formData.append('contentType', contentType);
    formData.append('file', mainFile);
    if (fileType === 'VIDEO') {
      formData.append('thumbnail', thumbnailFile as Blob);
    }

    try {
      await api.post('/content-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('콘텐츠가 등록 되었습니다.');
      setTitle('');
      setDescription('');
      setMainFile(null);
      setThumbnailFile(null);
      loadContents(); // 등록 후 자동 리로드
    } catch (err) {
      console.error(err);
      alert('등록 실패');
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-4">콘텐츠 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">파일 타입</label>
              <select
                value={fileType}
                onChange={e => setFileType(e.target.value as FileType)}
                className="w-full border p-2 rounded"
              >
                <option value="VIDEO">VIDEO</option>
                <option value="IMAGE">IMAGE</option>
                <option value="DOCUMENT">DOCUMENT</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold">콘텐츠 유형</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value as ContentType)}
                className="w-full border p-2 rounded"
              >
                <option value="HBS">HBS</option>
                <option value="PROMO">PROMO</option>
                <option value="MEDIA">MEDIA</option>
                <option value="CI_BI">CI_BI</option>
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

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
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
              className="border rounded overflow-hidden shadow hover:shadow-lg transition"
            >
              {item.thumbnailUrl ? (
                <img
                  src={`${FILE_BASE_URL}${item.thumbnailUrl}`}
                  alt={item.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                  No Thumbnail
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
    </Layout>
  );
}

export default ContentManager;

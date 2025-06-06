import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import api from '../../../services/api';
import { FileType, ContentType, HbsContent } from '../../../types/HbsContent';
import { FILE_BASE_URL } from '../../../config/config';
import { useNavigate } from 'react-router-dom';
import { fetchHbsCreate, fetchS3Create } from '../../../services/hbsApi';
// 에디터용 import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Base64UploadAdapterPlugin } from "../../../types/Common/ckeditor";

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
  const [content, setContent] = useState<string>(''); 

  // 필터링용 상태
  const [filterFileType, setFilterFileType] = useState<FileType | ''>('');
  const [filterContentType, setFilterContentType] = useState<ContentType | ''>('');

  // 유튜브용 상태
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // 테스트 필터링용 함수
  const fetchFilteredContents = async (fileType: FileType | '', contentType: ContentType | '') => {
    try {
      const res = await api.get('/contents', {
        params: {
          fileType: fileType || undefined,
          contentType: contentType || undefined,
        },
      });
      setContents(res.data);
    } catch (err) {
      console.error(err);
      alert('콘텐츠 불러오기 실패');
    }
  };

  useEffect(() => {
    fetchFilteredContents('',''); // 초기 로딩시 전체 목록
    loadContents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const htmlContent = content;

    if (!title || !description || !htmlContent) return alert('제목과 설명을 입력해주세요.');

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
    formData.append('content', htmlContent);

    if (fileType === 'LINK') {
      formData.append('fileUrl', youtubeEmbedUrl);
      formData.append('thumbnailUrl', youtubeImgUrl);
    } else {
      formData.append('file', mainFile as Blob);
      if (fileType === 'VIDEO') formData.append('thumbnail', thumbnailFile as Blob);
    }

    try {
      await fetchHbsCreate(formData);
      //await fetchS3Create(formData);
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

          <label className="block font-semibold mb-1">콘텐츠 (에디터)</label>
          <CKEditor
            editor={ClassicEditor as any}
            config={{
              extraPlugins: [Base64UploadAdapterPlugin],
            }}
            data={content}
            onChange={(event: any, editor: any) => {
              const data = editor.getData();
              setContent(data);
            }}
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
        {/* 필터 셀렉트 박스 추가 */}
        <div className="flex justify-end gap-4 mb-4">
          <select
            value={filterFileType}
            onChange={(e) => {
              const value = e.target.value as FileType | '';
              setFilterFileType(value);
              fetchFilteredContents(value, filterContentType);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">파일 타입 전체</option>
            <option value="VIDEO">VIDEO</option>
            <option value="IMAGE">IMAGE</option>
            <option value="DOCUMENT">DOCUMENT</option>
            <option value="LINK">LINK</option>
          </select>

          <select
            value={filterContentType}
            onChange={(e) => {
              const value = e.target.value as ContentType | '';
              setFilterContentType(value);
              fetchFilteredContents(filterFileType, value);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">콘텐츠 타입 전체</option>
            <option value="HBS">HBS</option>
            <option value="PROMO">PROMO</option>
            <option value="MEDIA">MEDIA</option>
            <option value="CI_BI">CI_BI</option>
            <option value="YOUTUBE">YOUTUBE</option>
          </select>
        </div>

        <h3 className="text-xl font-bold mb-4">등록된 콘텐츠</h3>

        {/* 콘텐츠 목록 출력 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contents.map((item) => (
            <div
              key={item.fileId}
              onClick={() => navigate(`/admin/content-manager/${item.fileId}`)}
              className="cursor-pointer border rounded overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* 콘텐츠 타입별 미리보기 */}
              {item.fileType === 'LINK' && item.contentType === 'YOUTUBE' ? (
                <img
                src={`${item.thumbnailUrl}`}
                //src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-40 object-cover"
              />
              ) : item.thumbnailUrl ? (
                <img
                  src={`${FILE_BASE_URL}${item.thumbnailUrl}`}
                  //src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center px-2 text-sm text-gray-700 text-center">
                  등록된 파일명:<br />
                  <strong>📄{item.fileUrl?.split('/').pop()}</strong>
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
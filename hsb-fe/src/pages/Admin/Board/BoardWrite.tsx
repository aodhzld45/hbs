import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardItem, BoardType, BoardTypeTitleMap } from '../../../types/Admin/BoardItem';
import { fetchBoardCreate } from '../../../services/Admin/boardApi';
import AdminLayout from '../../../components/Layout/AdminLayout';

// 에디터용 import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Base64UploadAdapterPlugin } from '../../../types/Common/ckeditor';

const BoardWrite = () => {
  const navigate = useNavigate();
  const { boardType } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writerName, setWriterName] = useState('');
  const [useTf, setUseTf] = useState<'Y' | 'N'>('Y');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;

  useEffect(() => {
    console.log('현재 boardType:', boardType);
    console.log('safeBoardType (대문자):', safeBoardType);
  }, [boardType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('boardType', safeBoardType);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('writerName', writerName);
      formData.append('useTf', useTf);
      files.forEach((file) => formData.append('files', file));
  
      const response = await fetchBoardCreate(formData); // 응답값 받아오기
  
      if (typeof response === 'string' && response.includes('성공')) {
        alert(response); 
        navigate(`/admin/board/${safeBoardType}`);
      } else {
        alert(response || '등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('등록 실패:', error);
      alert('게시글 등록 중 오류가 발생했습니다.');
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    updateFiles(selectedFiles);
  };

  // 파일 제거 핸들러
  const handleRemoveFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const updateFiles = (newFiles: File[]) => {
    setFiles((prev) => {
      const fileMap = new Map();
      [...prev, ...newFiles].forEach((file) => fileMap.set(file.name, file));
      return Array.from(fileMap.values()).slice(0, 3);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    updateFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{BoardTypeTitleMap[safeBoardType]} 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-6 border p-6 bg-white rounded shadow">
          <div className="grid grid-cols-5 gap-4 items-center">
            <label className="col-span-1 font-semibold">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-4 border px-3 py-2 rounded"
              required
            />

            <label className="col-span-1 font-semibold">작성자</label>
            <input
              type="text"
              value={writerName}
              onChange={(e) => setWriterName(e.target.value)}
              className="col-span-4 border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">내용</label>
            <CKEditor
              editor={ClassicEditor as any}
              config={{ extraPlugins: [Base64UploadAdapterPlugin] }}
              data={content}
              onChange={(event: any, editor: any) => {
                const data = editor.getData();
                setContent(data);
              }}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">첨부파일 (최대 3개)</label>

            {/* ✅ Drag & Drop 영역 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded px-4 py-6 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer text-blue-600 underline">
                파일 선택 또는 여기로 드래그하세요
              </label>
            </div>

            {/* 파일 목록 */}
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>• {file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 text-sm hover:underline ml-2"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="col-span-1 font-semibold">노출여부</label>
            <select
              value={useTf}
              onChange={(e) => setUseTf(e.target.value as 'Y' | 'N')}
              className="col-span-4 border px-3 py-2 rounded"
            >
              <option value="Y">보이기</option>
              <option value="N">숨기기</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BoardWrite;

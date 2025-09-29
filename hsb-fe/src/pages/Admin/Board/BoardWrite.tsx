import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  BoardItem,
  BoardFileItem,
  BoardType,
  BoardTypeTitleMap,
} from '../../../types/Admin/BoardItem';
import { fetchBoardCreate, fetchBoardDetail, fetchBoardUpdate } from '../../../services/Admin/boardApi';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { FILE_BASE_URL } from '../../../config/config';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Base64UploadAdapterPlugin } from '../../../types/Common/ckeditor';

/** datetime-local <-> ISO 헬퍼 */
function toInputValue(v?: string | null): string {
  if (!v) return '';
  // 백엔드가 '2025-09-28T13:40:00' 형태면 그대로 사용 가능
  // 혹시 초가 없거나 ' ' 공백이 오면 정규화
  return v.replace(' ', 'T').slice(0, 16);
}
function fromInputValue(v: string): string | '' {
  return v ? v : '';
}

const BoardWrite = () => {
  const navigate = useNavigate();
  const { boardType, id } = useParams();
  const location = useLocation();
  const state = location.state as { board?: BoardItem };
  const isEdit = !!id;
  const safeBoardType = (boardType?.toUpperCase() ?? 'NOTICE') as BoardType;
  const [replacedFileIndexes, setReplacedFileIndexes] = useState<number[]>([]);


  const [form, setForm] = useState<Partial<BoardItem>>({
    title: '',
    content: '',
    writerName: '',
    useTf: 'Y',
    // 공지 기본값
    noticeTf: 'N',
    noticeSeq: 0,
    noticeStart: null,
    noticeEnd: null,
  });

  const [existingFiles, setExistingFiles] = useState<(BoardFileItem | File)[]>([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const loadData = async () => {
        try {
          const boardData: BoardItem = state?.board ?? await fetchBoardDetail(Number(id));
          const {
            title, content, writerName, useTf, files,
            noticeTf, noticeSeq, noticeStart, noticeEnd
          } = boardData; 

          setForm({
            title, content, writerName, useTf,
            // 공지 필드 주입(없으면 기본값)
            noticeTf: noticeTf ?? 'N',
            noticeSeq: noticeSeq ?? 0,
            noticeStart: noticeStart ?? null,
            noticeEnd: noticeEnd ?? null,
          });          
          setExistingFiles(files || []);
        } catch (err) {
          alert('게시글 정보를 불러오는 데 실패했습니다.');
        }
      };
      loadData();
    }
  }, [id, isEdit, state?.board]);

  const updateFiles = (
    prev: (BoardFileItem | File)[],
    newFiles: File[],
    isEdit: boolean
  ): (BoardFileItem | File)[] => {
    if (isEdit) {
      const updated = [...prev];
      let usedIndexes = [...replacedFileIndexes]; // 기존 교체된 인덱스 추적
      let changed = false;
  
      for (let i = 0; i < newFiles.length; i++) {
        let targetIndex = -1;
  
        // 아직 교체되지 않은 인덱스를 찾아서 파일 교체
        for (let j = 0; j < updated.length; j++) {
          if (!usedIndexes.includes(j)) {
            targetIndex = j;
            break;
          }
        }
  
        // 다 교체된 경우 추가하거나 무시
        if (targetIndex !== -1) {
          updated[targetIndex] = newFiles[i];
          usedIndexes.push(targetIndex);
          changed = true;
        } else if (updated.length < 3) {
          updated.push(newFiles[i]);
          usedIndexes.push(updated.length - 1);
          changed = true;
        }
      }
  
      if (changed) {
        setReplacedFileIndexes(usedIndexes);
      }
  
      return updated.slice(0, 3);
    } else {
      const addable = newFiles.slice(0, 3 - prev.length);
      return [...prev, ...addable].slice(0, 3);
    }
  };

    /** 간단 검증: 공지 설정 유효성 */
  const validate = (): string | null => {
    if (form.noticeTf === 'Y') {
      const seq = Number(form.noticeSeq ?? 0);
      if (Number.isNaN(seq) || seq < 0 || seq > 9999) {
        return '공지 우선순위는 0~9999 사이 숫자여야 합니다.';
      }
      if (form.noticeStart && form.noticeEnd) {
        const s = new Date(form.noticeStart);
        const e = new Date(form.noticeEnd);
        if (s.getTime() > e.getTime()) {
          return '공지 시작일은 만료일보다 늦을 수 없습니다.';
        }
      }
    }
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('boardType', safeBoardType);
      formData.append('title', form.title || '');
      formData.append('content', form.content || '');
      formData.append('writerName', form.writerName || '');
      formData.append('useTf', form.useTf || 'Y');

      // 공지 필드 추가
      formData.append('noticeTf', form.noticeTf ?? 'N');
      formData.append('noticeSeq', String(form.noticeSeq ?? 0));
      formData.append('noticeStart', fromInputValue(toInputValue(form.noticeStart)));
      formData.append('noticeEnd', fromInputValue(toInputValue(form.noticeEnd)));

      const existingFileIds = existingFiles
        .filter((f): f is BoardFileItem => !(f instanceof File))
        .map((f) => String(f.id));
      formData.append('existingFileIds', existingFileIds.join(','));
  
      existingFiles.forEach((f) => {
        if (f instanceof File) {
          formData.append('files', f);
        }
      });

      formData.forEach((value, key) => {
        //console.log(`${key}: ${value}`);
      });
  
      //  여기서 분기 처리 수정시
      const response = isEdit
        ? await fetchBoardUpdate(formData, Number(id))
        : await fetchBoardCreate(formData);
  
      if (typeof response === 'string' && response.includes('성공')) {
        alert(response);
        navigate(`/admin/board/${boardType}`);
      } else {
        alert(response || (isEdit ? '수정 중 오류가 발생했습니다.' : '등록 중 오류가 발생했습니다.'));
      }
    } catch (error) {
      console.error(isEdit ? '수정 실패:' : '등록 실패:', error);
      alert(isEdit ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleReplaceFile = (index: number, newFile: File) => {
    setExistingFiles((prev) => {
      const updated = [...prev];
      updated[index] = newFile;
      return updated;
    });
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;
    setExistingFiles((prev) => updateFiles(prev, droppedFiles, isEdit));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          {BoardTypeTitleMap[safeBoardType]} {isEdit ? '수정' : '등록'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 border p-6 bg-white rounded shadow">
          {/*  공지 설정 UI */}
          <div className="rounded-lg border p-4 bg-gray-50">
            <div className="mb-3 flex items-center gap-4">
              <label className="font-semibold w-28">공지 여부</label>
              <select
                value={form.noticeTf ?? 'N'}
                onChange={(e) => setForm((prev) => ({ ...prev, noticeTf: e.target.value as 'Y'|'N' }))}
                className="border px-3 py-2 rounded w-40"
              >
                <option value="N">일반글</option>
                <option value="Y">공지글</option>
              </select>

              <label className="font-semibold w-28">우선순위</label>
              <input
                type="number"
                min={0}
                max={9999}
                value={form.noticeSeq ?? 0}
                onChange={(e) => setForm((prev) => ({ ...prev, noticeSeq: Number(e.target.value) }))}
                className="border px-3 py-2 rounded w-32"
                disabled={(form.noticeTf ?? 'N') !== 'Y'}
                placeholder="예: 10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">공지 시작일</label>
                <input
                  type="datetime-local"
                  value={toInputValue(form.noticeStart)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, noticeStart: e.target.value || null }))
                  }
                  className="border px-3 py-2 rounded w-full"
                  disabled={(form.noticeTf ?? 'N') !== 'Y'}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">공지 만료일</label>
                <input
                  type="datetime-local"
                  value={toInputValue(form.noticeEnd)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, noticeEnd: e.target.value || null }))
                  }
                  className="border px-3 py-2 rounded w-full"
                  disabled={(form.noticeTf ?? 'N') !== 'Y'}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              • 공지는 리스트 1페이지 상단에만 표시됩니다. • 기간 미설정 시 해제 전까지 고정됩니다. • 우선순위가 클수록 더 위에 노출됩니다.
            </p>
          </div>
          <div className="grid grid-cols-5 gap-4 items-center">
            <label className="col-span-1 font-semibold">제목</label>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="col-span-4 border px-3 py-2 rounded"
              required
            />

            <label className="col-span-1 font-semibold">작성자</label>
            <input
              type="text"
              value={form.writerName || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, writerName: e.target.value }))}
              className="col-span-4 border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">내용</label>
            <CKEditor
              editor={ClassicEditor as any}
              config={{ extraPlugins: [Base64UploadAdapterPlugin] }}
              data={form.content || ''}
              onChange={(event: any, editor: any) => {
                const data = editor.getData();
                setForm((prev) => ({ ...prev, content: data }));
              }}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">첨부파일 (최대 3개)</label>
            <div className="mb-2">
              <ul className="text-sm text-gray-700 space-y-1">
                {existingFiles.map((file, index) => (
                  <li key={file instanceof File ? index : file.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!(file instanceof File) ? (
                        <a
                          href={`${FILE_BASE_URL}/api/file/download?filePath=${encodeURIComponent(
                            file.filePath
                          )}&originalName=${encodeURIComponent(file.originalFileName)}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📎 {file.originalFileName}
                        </a>
                      ) : (
                        <span className="text-gray-800">📄 {file.name}</span>
                      )}
                      <label className="cursor-pointer text-yellow-600 hover:underline">
                        ✏️
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleReplaceFile(index, e.target.files[0]);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="text-red-500 hover:underline"
                        onClick={() => handleRemoveExistingFile(index)}
                      >
                        ❌
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded px-4 py-6 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    const selectedFiles = Array.from(e.target.files);
                    setExistingFiles((prev) => updateFiles(prev, selectedFiles, isEdit));
                  }
                }}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer text-blue-600 underline">
                파일 선택 또는 여기로 드래그하세요
              </label>
              <p className="text-sm text-gray-400 mt-1">(파일은 기존 목록에 바로 반영됩니다)</p>
            </div>
          </div>

          <div>
            <label className="col-span-1 font-semibold">노출여부</label>
            <select
              value={form.useTf}
              onChange={(e) => setForm((prev) => ({ ...prev, useTf: e.target.value as 'Y' | 'N' }))}
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
              {isEdit ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BoardWrite;

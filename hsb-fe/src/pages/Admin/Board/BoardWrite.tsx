import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { FILE_BASE_URL } from '../../../config/config';
import { Base64UploadAdapterPlugin } from '../../../types/Common/ckeditor';
import { BoardFileItem, BoardItem, getBoardDisplayName } from '../../../types/Admin/BoardItem';
import { BoardConfigItem, parseBoardCategories } from '../../../types/Admin/BoardConfigItem';
import { fetchBoardCreate, fetchBoardDetail, fetchBoardUpdate } from '../../../services/Admin/boardApi';
import { fetchActiveBoardConfigOptions, fetchBoardConfigByCode } from '../../../services/Admin/boardConfigApi';

function toInputValue(value?: string | null): string {
  return value ? value.replace(' ', 'T').slice(0, 16) : '';
}

function fromInputValue(value: string): string {
  return value || '';
}

const BoardWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { boardCode, id } = useParams();
  const initialBoardCode = boardCode?.toUpperCase() ?? '';
  const state = location.state as { board?: BoardItem } | null;
  const isEdit = Boolean(id);

  const [boardConfigs, setBoardConfigs] = useState<BoardConfigItem[]>([]);
  const [selectedBoardCode, setSelectedBoardCode] = useState(initialBoardCode);
  const [boardConfig, setBoardConfig] = useState<BoardConfigItem | null>(null);
  const [existingFiles, setExistingFiles] = useState<(BoardFileItem | File)[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<Partial<BoardItem>>({
    boardCode: initialBoardCode,
    title: '',
    content: '',
    writerName: '',
    imagePath: '',
    useTf: 'Y',
    noticeTf: 'N',
    noticeSeq: 0,
    noticeStart: null,
    noticeEnd: null,
    categoryCode: null,
  });

  useEffect(() => {
    fetchActiveBoardConfigOptions()
      .then((items) => {
        setBoardConfigs(items);
        if (!selectedBoardCode && items.length > 0) {
          const defaultBoardCode = items[0].boardCode;
          setSelectedBoardCode(defaultBoardCode);
          setForm((prev) => ({ ...prev, boardCode: defaultBoardCode }));
        }
      })
      .catch((error) => {
        console.error('게시판 설정 목록 조회 실패:', error);
        alert('게시판 설정 목록을 불러오지 못했습니다.');
      });
  }, [selectedBoardCode]);

  useEffect(() => {
    if (!selectedBoardCode) {
      setBoardConfig(null);
      return;
    }

    fetchBoardConfigByCode(selectedBoardCode)
      .then(setBoardConfig)
      .catch((error) => {
        console.error('게시판 설정 조회 실패:', error);
        alert('게시판 설정을 불러오지 못했습니다.');
      });
  }, [selectedBoardCode]);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    const loadData = async () => {
      try {
        const boardData = state?.board ?? (await fetchBoardDetail(Number(id)));
        const nextBoardCode = (boardData.boardCode ?? '').toUpperCase();
        setSelectedBoardCode(nextBoardCode);
        setForm({
          boardCode: nextBoardCode,
          title: boardData.title,
          content: boardData.content,
          writerName: boardData.writerName,
          imagePath: boardData.imagePath ?? '',
          useTf: boardData.useTf,
          noticeTf: boardData.noticeTf ?? 'N',
          noticeSeq: boardData.noticeSeq ?? 0,
          noticeStart: boardData.noticeStart ?? null,
          noticeEnd: boardData.noticeEnd ?? null,
          categoryCode: boardData.categoryCode ?? null,
        });
        setExistingFiles(boardData.files ?? []);
      } catch (error) {
        console.error('게시글 상세 조회 실패:', error);
        alert('게시글 정보를 불러오지 못했습니다.');
      }
    };

    loadData();
  }, [id, isEdit, state?.board]);

  useEffect(() => {
    if (!boardConfig) {
      return;
    }

    setForm((prev) => {
      const nextForm = {
        ...prev,
        boardCode: boardConfig.boardCode,
      };

      if (boardConfig.noticeTf !== 'Y') {
        nextForm.noticeTf = 'N';
        nextForm.noticeSeq = 0;
        nextForm.noticeStart = null;
        nextForm.noticeEnd = null;
      }

      if (boardConfig.categoryTf !== 'Y') {
        nextForm.categoryCode = null;
      }

      if (boardConfig.skinType !== 'GALLERY') {
        nextForm.imagePath = '';
        setThumbnailFile(null);
      }

      return nextForm;
    });
  }, [boardConfig]);

  const categories = useMemo(() => parseBoardCategories(boardConfig?.categoryJson), [boardConfig?.categoryJson]);
  const boardName = getBoardDisplayName(selectedBoardCode, boardConfig?.boardName ?? form.boardName);
  const canUseNotice = boardConfig?.noticeTf === 'Y';
  const canUseFiles = boardConfig?.fileTf !== 'N';
  const canUseCategory = boardConfig?.categoryTf === 'Y';
  const isGallerySkin = boardConfig?.skinType === 'GALLERY';
  
const thumbnailPreviewUrl = useMemo(() => {
    // 1. 새로 선택한 파일이 있다면 브라우저 임시 URL 생성
    if (thumbnailFile) {
      return URL.createObjectURL(thumbnailFile);
    }
    
    // 2. 새로 선택한 파일은 없지만, 기존에 저장된 이미지 경로가 있다면 서버 URL 조합
    if (form.imagePath) {
      return `${FILE_BASE_URL}/${form.imagePath}`;
    }
    
    // 3. 둘 다 없다면 null 반환
    return null;
  }, [form.imagePath, thumbnailFile]);

  useEffect(() => {
    return () => {
      if (thumbnailFile && thumbnailPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailFile, thumbnailPreviewUrl]);

  const updateFiles = (prev: (BoardFileItem | File)[], newFiles: File[]): (BoardFileItem | File)[] => {
    const merged = [...prev];
    newFiles.forEach((file) => {
      if (merged.length < 3) {
        merged.push(file);
      }
    });
    return merged.slice(0, 3);
  };

  const validate = (): string | null => {
    if (!selectedBoardCode) {
      return '게시판을 선택해주세요.';
    }
    if (!form.title?.trim()) {
      return '제목은 필수입니다.';
    }
    if (!form.writerName?.trim()) {
      return '작성자는 필수입니다.';
    }
    if (canUseCategory && !form.categoryCode) {
      return '카테고리를 선택해주세요.';
    }
    if (isGallerySkin && !thumbnailFile && !form.imagePath) {
      return '갤러리 스킨은 썸네일 이미지를 등록해야 합니다.';
    }
    if (canUseNotice && form.noticeTf === 'Y' && form.noticeStart && form.noticeEnd) {
      if (new Date(form.noticeStart).getTime() > new Date(form.noticeEnd).getTime()) {
        return '공지 시작일은 종료일보다 늦을 수 없습니다.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('boardCode', selectedBoardCode);
      formData.append('categoryCode', String(form.categoryCode ?? ''));
      formData.append('title', form.title ?? '');
      formData.append('content', form.content ?? '');
      formData.append('writerName', form.writerName ?? '');
      formData.append('imagePath', String(form.imagePath ?? ''));
      formData.append('useTf', form.useTf ?? 'Y');
      formData.append('noticeTf', canUseNotice ? form.noticeTf ?? 'N' : 'N');
      formData.append('noticeSeq', String(form.noticeSeq ?? 0));
      formData.append('noticeStart', fromInputValue(toInputValue(form.noticeStart)));
      formData.append('noticeEnd', fromInputValue(toInputValue(form.noticeEnd)));

      const existingFileIds = existingFiles
        .filter((file): file is BoardFileItem => !(file instanceof File))
        .map((file) => String(file.id));
      formData.append('existingFileIds', existingFileIds.join(','));

      existingFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append('files', file);
        }
      });

      if (isGallerySkin && thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = isEdit
        ? await fetchBoardUpdate(formData, Number(id))
        : await fetchBoardCreate(formData);

      alert(response);
      navigate(`/admin/board/${selectedBoardCode}`);
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      alert('게시글 저장에 실패했습니다.');
    }
  };

  const handleRemoveFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleReplaceFile = (index: number, nextFile: File) => {
    setExistingFiles((prev) => {
      const copied = [...prev];
      copied[index] = nextFile;
      return copied;
    });
  };

  const handleBoardCodeChange = (nextBoardCode: string) => {
    setSelectedBoardCode(nextBoardCode);
    setExistingFiles([]);
    setThumbnailFile(null);
    setForm((prev) => ({
      ...prev,
      boardCode: nextBoardCode,
      imagePath: '',
      categoryCode: null,
      noticeTf: 'N',
      noticeSeq: 0,
      noticeStart: null,
      noticeEnd: null,
    }));
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl p-6">
        <h2 className="mb-6 text-2xl font-bold">
          {boardName} {isEdit ? '수정' : '등록'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 rounded border bg-white p-6 shadow">
          <div className="grid grid-cols-5 items-center gap-4">
            <label className="col-span-1 font-semibold">게시판</label>
            <select
              value={selectedBoardCode}
              onChange={(e) => handleBoardCodeChange(e.target.value)}
              className="col-span-4 rounded border px-3 py-2"
              disabled={isEdit}
              required
            >
              <option value="">게시판 선택</option>
              {boardConfigs.map((item) => (
                <option key={item.id} value={item.boardCode}>
                  {item.boardName} ({item.boardCode})
                </option>
              ))}
            </select>
          </div>

          {canUseNotice && (
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="w-24 font-semibold">공지 여부</label>
                <select
                  value={form.noticeTf ?? 'N'}
                  onChange={(e) => setForm((prev) => ({ ...prev, noticeTf: e.target.value as 'Y' | 'N' }))}
                  className="w-40 rounded border px-3 py-2"
                >
                  <option value="N">일반글</option>
                  <option value="Y">공지글</option>
                </select>

                <label className="w-24 font-semibold">우선순위</label>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={form.noticeSeq ?? 0}
                  onChange={(e) => setForm((prev) => ({ ...prev, noticeSeq: Number(e.target.value) }))}
                  className="w-32 rounded border px-3 py-2"
                  disabled={form.noticeTf !== 'Y'}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold">공지 시작일</label>
                  <input
                    type="datetime-local"
                    value={toInputValue(form.noticeStart)}
                    onChange={(e) => setForm((prev) => ({ ...prev, noticeStart: e.target.value || null }))}
                    className="w-full rounded border px-3 py-2"
                    disabled={form.noticeTf !== 'Y'}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold">공지 종료일</label>
                  <input
                    type="datetime-local"
                    value={toInputValue(form.noticeEnd)}
                    onChange={(e) => setForm((prev) => ({ ...prev, noticeEnd: e.target.value || null }))}
                    className="w-full rounded border px-3 py-2"
                    disabled={form.noticeTf !== 'Y'}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 items-center gap-4">
            <label className="col-span-1 font-semibold">제목</label>
            <input
              type="text"
              value={form.title ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="col-span-4 rounded border px-3 py-2"
              required
            />

            <label className="col-span-1 font-semibold">작성자</label>
            <input
              type="text"
              value={form.writerName ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, writerName: e.target.value }))}
              className="col-span-4 rounded border px-3 py-2"
              required
            />

            {canUseCategory && (
              <>
                <label className="col-span-1 font-semibold">카테고리</label>
                <select
                  value={form.categoryCode ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryCode: e.target.value || null }))}
                  className="col-span-4 rounded border px-3 py-2"
                >
                  <option value="">카테고리 선택</option>
                  {categories
                    .filter((category) => category.useTf !== 'N')
                    .map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </>
            )}
          </div>

          {isGallerySkin && (
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
              <div>
                <label className="mb-2 block font-semibold">썸네일 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded border bg-white px-3 py-2"
                />
                <p className="mt-2 text-sm text-gray-500">
                  갤러리 스킨에서는 목록 카드에 표시할 대표 이미지를 등록합니다.
                </p>
              </div>

              {thumbnailPreviewUrl && (
                <div className="overflow-hidden rounded border bg-white p-3">
                  <img src={thumbnailPreviewUrl} alt="썸네일 미리보기" className="h-40 w-56 rounded object-cover" />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block font-semibold">내용</label>
            <CKEditor
              editor={ClassicEditor as any}
              config={{ extraPlugins: [Base64UploadAdapterPlugin] }}
              data={form.content ?? ''}
              onChange={(_, editor) => {
                const data = editor.getData();
                setForm((prev) => ({ ...prev, content: data }));
              }}
            />
          </div>

          {canUseFiles && (
            <div>
              <label className="mb-1 block font-semibold">첨부파일 (최대 3개)</label>
              <div className="mb-2">
                <ul className="space-y-1 text-sm text-gray-700">
                  {existingFiles.map((file, index) => (
                    <li key={file instanceof File ? `${file.name}-${index}` : file.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {file instanceof File ? (
                          <span className="text-gray-800">{file.name}</span>
                        ) : (
                          <a
                            href={`${FILE_BASE_URL}/api/file/download?filePath=${encodeURIComponent(file.filePath)}&originalName=${encodeURIComponent(file.originalFileName)}`}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.originalFileName}
                          </a>
                        )}
                        <label className="cursor-pointer text-yellow-600 hover:underline">
                          교체
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const nextFile = e.target.files?.[0];
                              if (nextFile) {
                                handleReplaceFile(index, nextFile);
                              }
                            }}
                          />
                        </label>
                        <button type="button" className="text-red-500 hover:underline" onClick={() => handleRemoveFile(index)}>
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const droppedFiles = Array.from(e.dataTransfer.files);
                  setExistingFiles((prev) => updateFiles(prev, droppedFiles));
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                className={`rounded border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="board-file-input"
                  onChange={(e) => {
                    const selectedFiles = e.target.files;
                    if (selectedFiles) {
                      setExistingFiles((prev) => updateFiles(prev, Array.from(selectedFiles)));
                    }
                  }}
                />
                <label htmlFor="board-file-input" className="cursor-pointer text-blue-600 underline">
                  파일 선택 또는 드래그
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block font-semibold">노출 여부</label>
            <select
              value={form.useTf ?? 'Y'}
              onChange={(e) => setForm((prev) => ({ ...prev, useTf: e.target.value as 'Y' | 'N' }))}
              className="rounded border px-3 py-2"
            >
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate(-1)} className="rounded bg-gray-400 px-4 py-2 text-white">
              취소
            </button>
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              {isEdit ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BoardWrite;
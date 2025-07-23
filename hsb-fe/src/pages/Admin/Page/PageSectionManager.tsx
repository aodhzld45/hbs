import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import { FILE_BASE_URL } from '../../../config/config';

import { Block, PageSectionItem } from "../../../types/Admin/PageSectionItem";
import SectionEditModal from "../../../components/Admin/Page/SectionEditModal";
import { fetchPageSectonList, updatePageSectionUseTf, fetchDeletePageSection, updatePageSectionOrder } from "../../../services/Admin/pageSectionApi";

// 관리자 정보 불러오기
import { useAuth } from '../../../context/AuthContext';

// 미리보기용
import SectionPreviewModal from "./SectionPreviewModal";

type Props = {
  selectedPageId: number;
};

const PageSectionManager: React.FC<Props> = ({ selectedPageId }) => {
  const admin = useAuth();
  const [adminId, setAdminId] = useState(admin.admin?.id || null);

  const [sections, setSections] = useState<PageSectionItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editSectionItem, setEditSectionItem] = useState<PageSectionItem | null>(null);
  const [previewSection, setPreviewSection] = useState<PageSectionItem | null>(null);

  const loadSections = async () => {
    try {
      const res = await fetchPageSectonList(selectedPageId, keyword, page, size);
      const parsed = res.items.map((section: PageSectionItem) => ({
        ...section,
        optionJson:
          typeof section.optionJson === "string"
            ? JSON.parse(section.optionJson)
            : section.optionJson,
        files: section.files ?? [], // ✅ files 누락 보완
      }));
      setSections(parsed);
    } catch (error) {
      console.error(error);
      alert("페이지 섹션 조회에 실패하였습니다. 관리자에게 문의해주세요.");
    }
  };

  const handleEditSection = (section: PageSectionItem) => {
    setEditSectionItem(section);
    setShowSectionModal(true);
  };

  const handlePreviewSection = (section: PageSectionItem) => {
    const parsedJson = typeof section.optionJson === 'string'
      ? JSON.parse(section.optionJson)
      : section.optionJson;

    const fileMap = new Map<string, string>();
    (section.files ?? []).forEach(file => {
      fileMap.set(file.originalFileName, file.filePath);
    });

    const mapBlockSrc = (blocks: Block[]): Block[] => {
      return blocks.map((block) => {
        if ((block.type === 'IMAGE' || block.type === 'VIDEO')) {
          if (typeof block.src === 'string') {
            return block; // 이미 경로가 문자열이면 그대로 유지
          }
          const matched = fileMap.get(block.label ?? '');
          return {
            ...block,
            src: matched ? `${FILE_BASE_URL}${matched}` : '',
          };
        }
        return block;
      });
    };

    setPreviewSection({
      ...section,
      optionJson: {
        ...parsedJson,
        left: mapBlockSrc(parsedJson.left || []),
        right: mapBlockSrc(parsedJson.right || []),
      },
    });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(sections);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    reordered.forEach((item, index) => {
      item.orderSeq = index + 1;
    });

    setSections(reordered);
    try {
      await updatePageSectionOrder(
        reordered.map((section) => ({
          id: section.id,
          orderSeq: section.orderSeq
        }))
      );
    } catch (e) {
      console.error(e);
      alert('페이지 섹션 순서 저장에 실패하였습니다.');
    }
  };

  const handleToggleUseTf = async (item: PageSectionItem) => {
    try {
      const newUseTf = item.useTf === 'Y' ? 'N' : 'Y';

      if (!adminId) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }

      await updatePageSectionUseTf(item.id, newUseTf, adminId);
      alert('페이지 섹션 사용여부가 성공적으로 변경되었습니다.');
      await loadSections();
    } catch (error) {
      console.error('useTf 변경 실패:', error);
      alert('페이지 섹션 사용여부 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await fetchDeletePageSection(id, adminId ?? "관리자 정보 없음");
      alert('페이지가 성공적으로 삭제되었습니다.');
      await loadSections();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  const handleSuccess = async (updatedSection?: PageSectionItem) => {
    if (updatedSection) {
      handlePreviewSection(updatedSection); // 등록/수정 후 곧바로 렌더링 가능하게
    }
    await loadSections(); // 목록 갱신
  };

  useEffect(() => {
    if (selectedPageId) loadSections();
    setAdminId(admin.admin?.id || null);
  }, [selectedPageId]);

  return (
    <div className="w-full p-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          페이지 섹션 관리 (Page ID: {selectedPageId})
        </h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setEditSectionItem(null);
            setShowSectionModal(true);
          }}
        >
          + 섹션 추가
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sectionList">
          {(provided) => (
            <table
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-full table-auto border"
            >
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">순서</th>
                  <th className="border p-2">섹션명</th>
                  <th className="border p-2">레이아웃</th>
                  <th className="border p-2">사용 여부</th>
                  <th className="border p-2">관리</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="text-center bg-white hover:bg-gray-50"
                      >
                        <td className="border p-2">{section.orderSeq}</td>
                        <td className="border p-2">{section.sectionName}</td>
                        <td className="border p-2">{section.layoutType}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => handleToggleUseTf(section)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              section.useTf === 'Y'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            } hover:bg-green-200`}
                          >
                            {section.useTf === 'Y' ? '사용' : '미사용'}
                          </button>
                        </td>
                        <td className="border p-2 space-x-2">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => handleEditSection(section)}
                          >
                            편집
                          </button>
                          <button
                            className="text-green-600 hover:underline"
                            onClick={() => handlePreviewSection(section)}
                            >
                            미리보기
                          </button>
                          <button
                            className="text-red-500 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(section.id);
                            }}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>

      {showSectionModal && (
        <SectionEditModal
          pageId={selectedPageId}
          onClose={() => setShowSectionModal(false)}
          onSuccess={loadSections}
          initialData={editSectionItem}
        />
      )}

      {previewSection && (
        <SectionPreviewModal
          isOpen={!!previewSection}
          onClose={() => setPreviewSection(null)}
          section={previewSection}
        />
      )}
    </div>
  );
};

export default PageSectionManager;

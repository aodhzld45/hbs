import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import { PageSectionItem } from "../../../types/Admin/PageSectionItem";
import SectionEditModal from "../../../components/Admin/Page/SectionEditModal";

type Props = {
  selectedPageId: number;
};

const PageSectionManager: React.FC<Props> = ({ selectedPageId }) => {
  const [sections, setSections] = useState<PageSectionItem[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editSectionItem, setEditSectionItem] = useState<PageSectionItem | null>(null);

  const loadSections = async () => {
    // 👉 API로 섹션 불러오기 로직 필요
    // const res = await fetchSectionList(selectedPageId);
    // setSections(res);
  };

  const handleEditSection = (section: PageSectionItem) => {
    setEditSectionItem(section);
    setShowSectionModal(true);
  };

  const handlePreviewSection = (id: number) => {
    alert(`섹션 미리보기: ${id}`);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(sections);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    reordered.forEach((item, index) => {
      item.orderSeq = index + 1;
    });

    setSections(reordered);
    // 👉 필요 시 서버에 순서 업데이트
  };

  useEffect(() => {
    if (selectedPageId) loadSections();
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
                  <th className="border p-2">액션</th>
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
                        <td className="border p-2 space-x-2">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => handleEditSection(section)}
                          >
                            편집
                          </button>
                          <button
                            className="text-green-600 hover:underline"
                            onClick={() => handlePreviewSection(section.id)}
                          >
                            미리보기
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

      {/* 모달 */}
      {showSectionModal && (
        <SectionEditModal
          pageId={selectedPageId}
          onClose={() => setShowSectionModal(false)}
          onSuccess={loadSections}
          initialData={editSectionItem}
        />
      )}
    </div>
  );
};

export default PageSectionManager;

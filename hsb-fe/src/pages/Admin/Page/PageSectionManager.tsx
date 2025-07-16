import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";

import SectionEditModal from "../../../components/Admin/Page/SectionEditModal";

interface Section {
  id: number;
  sectionName: string;
  layoutType: string;
  dispSeq: number;
}

const PageSectionManager: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      sectionName: "AboutMe",
      layoutType: "TWO_COLUMN",
      dispSeq: 1
    },
    {
      id: 2,
      sectionName: "Profile",
      layoutType: "SINGLE",
      dispSeq: 2
    },
    {
      id: 3,
      sectionName: "Awards",
      layoutType: "GRID",
      dispSeq: 3
    }
  ]);

  // Drag & Drop 핸들러
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(sections);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // dispSeq 업데이트
    reordered.forEach((item, index) => {
      item.dispSeq = index + 1;
    });

    setSections(reordered);
  };

  const handleDelete = (id: number) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleEdit = (id: number) => {
    setEditingSectionId(id);
  };

  const handlePreview = (id: number) => {
    alert(`섹션 미리보기: ${id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        페이지 섹션 관리 (Page ID: {pageId})
      </h1>

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
        onClick={() => alert("섹션 추가 모달")}
      >
        + 섹션 추가
      </button>

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
                        className="text-center bg-white hover:bg-gray-50 transition"
                      >
                        <td className="border p-2">{section.dispSeq}</td>
                        <td className="border p-2">{section.sectionName}</td>
                        <td className="border p-2">{section.layoutType}</td>
                        <td className="border p-2">
                          <button
                            className="text-blue-600 hover:underline mr-3"
                            onClick={() => handleEdit(section.id)}
                          >
                            편집
                          </button>
                          <button
                            className="text-green-600 hover:underline mr-3"
                            onClick={() => handlePreview(section.id)}
                          >
                            미리보기
                          </button>
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => handleDelete(section.id)}
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
      {editingSectionId !== null && (
        <SectionEditModal
            onClose={() => setEditingSectionId(null)}
        />
      )}
    </div>

  );
};

export default PageSectionManager;

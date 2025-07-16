import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import SectionEditModal from "../../../components/Admin/Page/SectionEditModal";

interface Page {
  id: number;
  name: string;
  url: string;
  useTf: string;
}

interface Section {
  id: number;
  sectionName: string;
  layoutType: string;
  dispSeq: number;
}

const PageManager: React.FC = () => {
  // 페이지 리스트 (Dummy)
  const [pages] = useState<Page[]>([
    { id: 1, name: "메인", url: "/", useTf: "Y" },
    { id: 2, name: "About", url: "/about", useTf: "Y" },
    { id: 3, name: "Contact", url: "/contact", useTf: "N" }
  ]);

  // 현재 선택된 페이지
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);

  // 선택된 페이지 섹션 (Dummy)
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

  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

  const handlePageSelect = (id: number) => {
    setSelectedPageId(id);
    // 👉 실제 구현 시 여기에 API로 pageId에 해당하는 sections를 불러오면 됩니다.
    console.log("선택된 Page ID:", id);
  };

  const handleDeleteSection = (id: number) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleEditSection = (id: number) => {
    setEditingSectionId(id);
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
      item.dispSeq = index + 1;
    });

    setSections(reordered);
  };

  return (
    <div className="flex">
      {/* 좌측 페이지 리스트 */}
      <div className="w-1/3 border-r p-6">
        <h2 className="text-xl font-bold mb-4">페이지 리스트</h2>
        <ul className="space-y-2">
          {pages.map((page) => (
            <li
              key={page.id}
              className={`p-3 rounded cursor-pointer border
                ${selectedPageId === page.id ? "bg-blue-50 border-blue-600 text-blue-800" : "hover:bg-gray-50"}
              `}
              onClick={() => handlePageSelect(page.id)}
            >
              <span className="font-semibold">{page.name}</span>
              <span className="ml-2 text-gray-500 text-sm">({page.url})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 우측 섹션 관리 */}
      <div className="w-2/3 p-6">
        {selectedPageId === null ? (
          <div className="text-gray-500">페이지를 선택해주세요.</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                페이지 섹션 관리 (Page ID: {selectedPageId})
              </h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => alert("섹션 추가 모달")}
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
                              className="text-center bg-white hover:bg-gray-50 transition"
                            >
                              <td className="border p-2">{section.dispSeq}</td>
                              <td className="border p-2">{section.sectionName}</td>
                              <td className="border p-2">{section.layoutType}</td>
                              <td className="border p-2">
                                <button
                                  className="text-blue-600 hover:underline mr-3"
                                  onClick={() => handleEditSection(section.id)}
                                >
                                  편집
                                </button>
                                <button
                                  className="text-green-600 hover:underline mr-3"
                                  onClick={() => handlePreviewSection(section.id)}
                                >
                                  미리보기
                                </button>
                                <button
                                  className="text-red-500 hover:underline"
                                  onClick={() => handleDeleteSection(section.id)}
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
          </>
        )}
      </div>

      {/* Level2 편집 모달 */}
      {editingSectionId !== null && (
        <SectionEditModal
          onClose={() => setEditingSectionId(null)}
        />
      )}
    </div>
  );
};

export default PageManager;

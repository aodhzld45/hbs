import React, { useState, useEffect } from "react";

// 공통 메뉴 목록 불러오기
import {
  fetchAdminMenus
} from '../../../services/Admin/adminMenuApi';
import { AdminMenu } from '../../../types/Admin/AdminMenu';
import { useLocation } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../components/Layout/AdminLayout";
import { useAuth } from '../../../context/AuthContext';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";

// 좌측 페이지 관련 import
import { PageItem } from '../../../types/Admin/PageItem';
import { fetchPageList, updatePageUseTf, fetchDeletePage } from "../../../services/Admin/pageApi";
import PageEditModal from "../../../components/Admin/Page/PageEditModal";
import SectionEditModal from "../../../components/Admin/Page/SectionEditModal";

interface Section {
  id: number;
  sectionName: string;
  layoutType: string;
  dispSeq: number;
}

const PageManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const  admin  = useAuth();
  const [adminId, setAdminId] = useState(admin.admin?.id || null);

  const [pageItem, setPageItem] = useState<PageItem[]>([]);
  const [editPageItem, setEditPageItem] = useState<PageItem | null>(null);
  const [showPageModal, setShowPageModal] = useState(false);


  const loadMenus = async () => {
    try {
      const data = await fetchAdminMenus();
      setMenus(data);

      // 현재 URL과 일치하는 메뉴 찾기
      const matched = data.find(
        (menu) => menu.url === location.pathname
      );

      if (matched) {
        setCurrentMenuTitle(matched.name);
      } else {
        setCurrentMenuTitle(null);
      }
 
    } catch (err) {
      console.error(err);
      setError('메뉴 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 추후에 공통으로 분리 -> 현재 메뉴 불러오기.
  useEffect(() => {
    loadMenus();
    setAdminId(admin.admin?.id || null);
  }, [admin.admin?.id]);

  const loadPageList = async () => {
    setLoading(true);
    try {
      const res = await fetchPageList();
      setPageItem(res);
    } catch (error) {
      console.error(error);
      alert('페이지 목록 조회에 실패하였습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUseTf = async (item: PageItem) => {
    try {
      const newUseTf = item.useTf === 'Y' ? 'N' : 'Y';
  
      if (!adminId) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }
  
      await updatePageUseTf(item.id, newUseTf, adminId);
      alert('페이지가 사용여부가 성공적으로 변경되었습니다.');
      await loadPageList();
    } catch (error) {
      console.error('useTf 변경 실패:', error);
      alert('사용여부 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await fetchDeletePage(id, adminId ?? "관리자 정보 없음");
      alert('페이지가 성공적으로 삭제되었습니다.');
      await loadPageList();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  useEffect(() => {
    loadPageList();
  }, []);


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
  <AdminLayout>
    <div className="flex">
      {/* 좌측 페이지 리스트 */}
      <div className="w-1/3 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentMenuTitle}</h2>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => {
              setEditPageItem(null);
              setShowPageModal(true);
            }}
          >
            + 페이지 추가
          </button>
        </div>

        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">페이지명</th>
              <th className="border px-2 py-1">URL</th>
              <th className="border px-2 py-1">사용 여부</th>
              <th className="border px-2 py-1">관리</th>
            </tr>
          </thead>
          <tbody>
            {pageItem.map((page) => (
              <tr
                key={page.id}
                className={`text-center cursor-pointer hover:bg-gray-50 ${
                  selectedPageId === page.id ? "bg-blue-50 border-blue-600 text-blue-800" : ""
                }`}
                onClick={() => handlePageSelect(page.id)}
              >
                <td className="border px-2 py-1 font-semibold">{page.name}</td>
                <td className="border px-2 py-1 text-sm text-gray-600">{page.url}</td>
                <td className="border px-2 py-1">
                  <button
                      onClick={() => handleToggleUseTf(page)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        page.useTf === 'Y'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      } hover:bg-green-200`}
                    >
                      {page.useTf === 'Y' ? '사용' : '미사용'}
                  </button>
                </td>
                <td className="border px-2 py-1 text-sm space-x-2">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditPageItem(page);
                      setShowPageModal(true);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(page.id);
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {/* 섹션 편집 모달 */}
      {editingSectionId !== null && (
        <SectionEditModal
          onClose={() => setEditingSectionId(null)}
        />
      )}

      {showPageModal && (
        <PageEditModal
          onClose={() => setShowPageModal(false)}
          onSuccess={loadPageList}
          initialData={editPageItem}
        />
      )}
    </div>
    </AdminLayout>
  );
};

export default PageManager;

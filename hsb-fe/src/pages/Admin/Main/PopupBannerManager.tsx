import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { AdminMenu } from '../../../types/Admin/AdminMenu';
import { useAuth } from '../../../context/AuthContext';

import { useLocation } from "react-router-dom";
import { FILE_BASE_URL } from '../../../config/config';
import dayjs from 'dayjs';
import Pagination from '../../../components/Common/Pagination';


import { PopupBannerItem } from '../../../types/Admin/PopupBannerItem';
import PopupBannerModal from "../../../components/Admin/PopupBanner/PopupBannerModal";
import { 
  fetchPopupBannerList,
  fetchPopupBannerOrder,
  updatePopupBannerUseTf,
  fetchPopupBannerDelete
} from '../../../services/Admin/popupBannerApi';

import {
  fetchAdminMenus
} from '../../../services/Admin/adminMenuApi';

const PopupBannerManager: React.FC = () => {
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const admin = useAuth();
  const [adminId, setAdminId] = useState(admin.admin?.id || null);
  const [items, setItems] = useState<PopupBannerItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PopupBannerItem | null>(null);

  const [type, setType] = useState<string>("popup");
  const [keyword, setKeyword] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const location = useLocation();

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

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await fetchPopupBannerList(type, keyword, page, size);
      setItems(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await fetchPopupBannerDelete(id, adminId ?? "관리자 정보 없음");
      loadList();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  const handleMove = async (item: PopupBannerItem, direction: "up" | "down") => {
    try {
      await fetchPopupBannerOrder(item.id, direction, adminId ?? "관리자 정보 없음");
      loadList();
    } catch (e) {
      alert("순서 변경 실패");
    }
  };

  const handleToggleUseTf = async (item: PopupBannerItem) => {
    try {
      const newUseTf = item.useTf === 'Y' ? 'N' : 'Y';
  
      if (!adminId) {
        alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }
  
      await updatePopupBannerUseTf(item.id, newUseTf, adminId);
  
      await loadList();
    } catch (error) {
      console.error('useTf 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  useEffect(() => {
    loadList();
  }, [type, keyword, page, size]);
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">{currentMenuTitle}</h2>
        <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">총 {totalCount}개</span>
    
            <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border px-3 py-2"
          >
            <option value="popup">팝업</option>
            <option value="banner">배너</option>
          </select>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      setPage(0);
                      loadList();
                  }
                }}
                placeholder="검색어 입력"
                className="border px-3 py-2 rounded"
              />
              <button
                onClick={() => {
                  setPage(0);
                  loadList();
                }}
                className="bg-gray-700 text-white px-4 rounded"
              >
                검색
              </button>

            </div>
          </div>

        <div className="flex justify-between mb-4">

        </div>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">순서</th>
                <th className="border p-2">썸네일</th>
                <th className="border p-2">제목</th>
                <th className="border p-2">타입</th>
                <th className="border p-2">시작일</th>
                <th className="border p-2">종료일</th>
                <th className="border p-2">사용</th>
                <th className="border p-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="text-center text-sm">
                  {/* 순서 및 화살표 */}
                  <td className="border px-3 py-4 align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleMove(item, "up")}
                        className="text-gray-500 hover:text-blue-600 text-xs"
                      >
                        ▲
                      </button>
                      <span className="font-semibold">{item.orderSeq}</span>
                      <button
                        onClick={() => handleMove(item, "down")}
                        className="text-gray-500 hover:text-blue-600 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {/* 썸네일 */}
                  <td className="border px-3 py-2 align-middle">
                    {item.filePath ? (
                      <img
                        src={`${FILE_BASE_URL}${item.filePath}`}
                        alt={item.title}
                        className="h-20 w-auto object-contain mx-auto"
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* 제목 */}
                  <td className="border px-3 py-2 align-middle">
                    {item.title}
                  </td>

                  {/* 타입 (한글로 변환) */}
                  <td className="border px-3 py-2 align-middle">
                    {item.type === "popup" ? "팝업" : "배너"}
                  </td>

                  {/* 시작일 */}
                  <td className="border px-3 py-2 align-middle">
                    {item.startDate
                      ? dayjs(item.startDate).format('YYYY-MM-DD HH:mm')
                      : ''}
                  </td>

                  {/* 종료일 */}
                  <td className="border px-3 py-2 align-middle">
                    {item.endDate
                      ? dayjs(item.endDate).format('YYYY-MM-DD HH:mm')
                      : ''}
                  </td>

                  {/* 사용 여부 */}
                  <td className="border px-3 py-2 align-middle">
                    <button
                      onClick={() => handleToggleUseTf(item)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        item.useTf === 'Y'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      } hover:bg-green-200`}
                    >
                      {item.useTf === 'Y' ? '사용' : '미사용'}
                    </button>
                  </td>

                  {/* 관리 (수정/삭제) */}
                  <td className="border px-3 py-2 align-middle">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:underline mr-3 text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              팝업/배너 등록
            </button>
          </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        
        {isModalOpen && (
          <PopupBannerModal
            onClose={() => setModalOpen(false)}
            onSuccess={loadList}
            initialData={editingItem}
            type={type}
          />
        )}

      </div>
    </AdminLayout>
  )
}

export default PopupBannerManager;


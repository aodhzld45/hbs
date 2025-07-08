import React, { useEffect, useState } from "react";
import { useAuth } from '../../../context/AuthContext';

import AdminLayout from '../../../components/Layout/AdminLayout';
import { CodeGroup } from "../../../types/Common/CodeGroup";
import { CodeDetail } from "../../../types/Common/CodeDetail";
import {
  fetchCodeGroups,
  createCodeGroup,
  updateOrderSequence,
  updateGroupUseTf,
  updateCodeGroup,
  deleteCodeGroup,
  fetchAllDetails,
  createCodeDetail,
  updateCodeDetail,
  updateCodeOrder,
  updateDetailUseTf,
  deleteCodeDetail,
  uploadCodeDetailsExcel
} from "../../../services/Common/CodeApi";

import GroupModal from "../../../components/Admin/Code/GroupModal";
import DetailModal from "../../../components/Admin/Code/DetailModal";

import { buildCodeDetailTree } from "../../../utils/buildCodeDetailTree";
import { flattenCodeDetailTree } from "../../../utils/codeDetailTreeFlattener";

const CodeManager: React.FC = () => {
  const [groupList, setGroupList] = useState<CodeGroup[]>([]);
  const [detailList, setDetailList] = useState<CodeDetail[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<{
    id: number;
    codeGroupId: string;
  } | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { admin } = useAuth();

  // 모달 부분
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CodeGroup | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<CodeDetail | null>(null);

  /** 그룹 목록 불러오기 */
  const loadGroups = async () => {
    try {
      setLoadingGroup(true);
      const res = await fetchCodeGroups();
      setGroupList(res);

      if (res.length > 0) {
        const firstGroup = res[0];
        setSelectedGroup({
          id: firstGroup.id,
          codeGroupId: firstGroup.codeGroupId,
        });
        loadAllDetailTree(firstGroup.id);
      }
    } catch (err) {
      console.error(err);
      alert("그룹 목록 조회 오류");
    } finally {
      setLoadingGroup(false);
    }
  };

  const loadAllDetailTree = async (groupId: number) => {
    try {
      setLoadingDetail(true);
      const allDetails = await fetchAllDetails(groupId);
  
      // 트리 생성
      const tree = buildCodeDetailTree(allDetails);
  
      // 플랫트리 생성 (렌더링용)
      const flatList = flattenCodeDetailTree(tree);
  
      // console.log(" 트리:", tree);
      // console.log(" 플랫:", flatList);
  
      setDetailList(flatList);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleGroupSelect = (groupId: string) => {
    const selected = groupList.find(g => g.codeGroupId === groupId);
    if (selected) {
      setSelectedGroup({
        id: selected.id,
        codeGroupId: selected.codeGroupId,
      });
      loadAllDetailTree(selected.id);

    }
  };

  // 그룹 순서 변경
  const moveGroup = async (index: number, direction: 'up' | 'down') => {
    const current = groupList[index];
    if (!current) return;

    let targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= groupList.length) {
      return; // 이동 불가
    }

    const target = groupList[targetIndex];
    if (!target) return;

    try {
      await updateOrderSequence(current.id, target.orderSeq!);
      
      // 변경 전에 현재 선택된 그룹 ID 저장
      const currentSelectedGroupId = selectedGroup?.codeGroupId;
      
      await loadGroups();
      
      // 로드 후에 이전에 선택된 그룹 ID로 다시 선택
      if (currentSelectedGroupId) {
        const newSelectedGroup = groupList.find(g => g.codeGroupId === currentSelectedGroupId);
        if (newSelectedGroup) {
          setSelectedGroup({
            id: newSelectedGroup.id,
            codeGroupId: newSelectedGroup.codeGroupId,
          });
          loadAllDetailTree(newSelectedGroup.id);
        }
      }
    } catch (error) {
      console.error("순서 변경 실패:", error);
      alert("순서 변경 실패");
    }
  };

  const moveDetail = async (detail: CodeDetail, direction: 'up' | 'down') => {
    const siblings = detailList
      .filter(
        (d) =>
          d.parentCodeId === detail.parentCodeId &&
          d.level === detail.level
      )
      .sort((a, b) => (a.orderSeq ?? 0) - (b.orderSeq ?? 0));
  
    const currentIndex = siblings.findIndex((d) => d.codeId === detail.codeId);
    if (currentIndex === -1) return;
  
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
  
    const target = siblings[targetIndex];
  
    try {
      await updateCodeOrder(detail.id!, { orderSequence: target.orderSeq! }, adminId!);
      await updateCodeOrder(target.id!, { orderSequence: detail.orderSeq! }, adminId!);
  
      await loadAllDetailTree(selectedGroup!.id);
    } catch (error) {
      console.error(error);
      alert("상세코드 순서 변경 실패");
    }
  };
  
  const handleToggleUseTf = async (
    item: CodeGroup | CodeDetail,
    type: "group" | "detail"
  ) => {
    try {
      const newUseTf = item.useTf === "Y" ? "N" : "Y";
  
      if (type === "group") {
        await updateGroupUseTf(item.id!, newUseTf, adminId!);
        alert("그룹 사용 여부가 변경되었습니다.");
        loadGroups();
      } else {
        await updateDetailUseTf(item.id!, newUseTf, adminId!);
        alert("상세코드 사용 여부가 변경되었습니다.");
        await loadAllDetailTree(selectedGroup!.id);
      }
    } catch (error) {
      console.error(error);
      alert("사용 여부 변경 실패");
    }
  };

  const handleDelete = async (id?: number, type?: "group" | "detail") => {

    if (!id) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    if (type === "group") {
      await deleteCodeGroup(id, adminId!);
    } else {
      await deleteCodeDetail(id, adminId!);
    }
    try {
      alert("코드가 성공적으로 삭제되었습니다.");
      loadGroups();
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // FormData 구성
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", String(selectedGroup?.id ?? 0));
    formData.append("adminId", adminId!);

    try {
      await uploadCodeDetailsExcel(formData);
      alert("엑셀 업로드가 완료되었습니다!");
      loadAllDetailTree(selectedGroup!.id);
    } catch (error) {
      console.error(error);
      alert("엑셀 업로드 실패!");
    }
  };
  
  const downloadSampleExcel = () => {
    const link = document.createElement('a');
    link.href = '/sample/상세코드_업로드_샘플.xlsx';
    link.download = '상세코드_업로드_샘플.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const adminId = admin?.id;
  if (!adminId) {
    alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
    return null;
  }

  return (
    <AdminLayout>
      <div className="flex gap-8 p-6">
        {/* 왼쪽: 그룹 관리 */}
        <div className="w-1/3">
          <h2 className="text-lg font-bold mb-3">코드 그룹 관리</h2>
          <table className="w-full border text-sm text-center-table">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">PK</th>
                <th className="border px-4 py-2">그룹ID</th>
                <th className="border px-4 py-2">그룹명</th>
                <th className="border px-4 py-2">순서</th>
                <th className="border px-4 py-2">상태</th>
                <th className="border px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {groupList.map((group, index) => (
                <tr
                  key={group.id}
                  className={`cursor-pointer ${
                    selectedGroup?.codeGroupId === group.codeGroupId
                      ? "bg-blue-100"
                      : ""
                  }`}
                  onClick={() => handleGroupSelect(group.codeGroupId)}
                >
                  <td className="border px-4 py-2">{group.id}</td>
                  <td className="border px-4 py-2">{group.codeGroupId}</td>
                  <td className="border px-4 py-2">{group.groupName}</td>
                  {/*  순서 표시 및 화살표 버튼 추가 */}
                  <td className="border px-2 py-2">
                    <div className="flex flex-col items-center space-y-1">
                      <span>{group.orderSeq}</span>
                      <div className="flex flex-col">
                        <button
                          className="text-xs text-gray-600 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveGroup(index, "up");
                          }}
                          disabled={index === 0} // 첫 번째는 up 불가
                        >
                          ▲
                        </button>
                        <button
                          className="text-xs text-gray-600 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveGroup(index, "down");
                          }}
                          disabled={index === groupList.length - 1} // 마지막은 down 불가
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                  <button
                    onClick={() => handleToggleUseTf(group, "group")}
                    className={`px-2 py-1 rounded text-xs ${
                      group.useTf === "Y"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    } hover:bg-green-200`}
                  >
                    {group.useTf === "Y" ? "사용" : "미사용"}
                  </button>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGroup(group);
                        setGroupModalOpen(true);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group.id, "group");
                      }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mt-4 bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => {
              setEditingGroup(null);
              setGroupModalOpen(true);
            }}
          >
            + 그룹 등록
          </button>
        </div>

        {/* 오른쪽: 상세코드 관리 */}
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-3">
            상세코드 관리
            {selectedGroup && (
              <span className="ml-2 text-blue-600">
                (Group ID: {selectedGroup.codeGroupId})
              </span>
            )}
          </h2>

          {selectedGroup ? (
            <>
              <table className="w-full border text-sm text-center-table">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">코드ID</th>
                    <th className="border p-2">부모코드</th>
                    <th className="border p-2">한글명</th>
                    <th className="border p-2">영문명</th>
                    <th className="border p-2">순서</th>
                    <th className="border p-2">사용여부</th>
                    <th className="border p-2">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {detailList.map((detail) => (
                    <tr key={detail.codeId}>
                      <td className="border p-2" style={{ paddingLeft: `${detail.level! * 20}px` }}>
                        {detail.codeId}
                      </td>
                      <td className="border p-2">{detail.parentCodeId || "-"}</td>
                      <td className="border p-2">{detail.label}</td>
                      <td className="border p-2">{detail.codeNameEn}</td>

                      <td className="border p-2">
                        <div className="flex flex-col items-center space-y-1">
                          <span>{detail.orderSeq}</span>
                          <div className="flex flex-col">
                            <button
                              className="text-xs text-gray-600 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveDetail(detail, "up");
                              }}
                              disabled={
                                detailList
                                  .filter(d => 
                                    d.parentCodeId === detail.parentCodeId &&
                                    d.level === detail.level
                                  )
                                  .findIndex(d => d.codeId === detail.codeId) === 0
                              }
                            >
                              ▲
                            </button>
                            <button
                              className="text-xs text-gray-600 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveDetail(detail, "down");
                              }}
                              disabled={
                                detailList
                                  .filter(d => 
                                    d.parentCodeId === detail.parentCodeId &&
                                    d.level === detail.level
                                  )
                                  .findIndex(d => d.codeId === detail.codeId) ===
                                detailList.filter(d =>
                                  d.parentCodeId === detail.parentCodeId &&
                                  d.level === detail.level
                                ).length - 1
                              }
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="border p-2">
                        <button
                          onClick={() => handleToggleUseTf(detail, "detail")}
                          className={`px-2 py-1 rounded text-xs ${
                            detail.useTf === "Y"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          } hover:bg-green-200`}
                        >
                          {detail.useTf === "Y" ? "사용" : "미사용"}
                        </button>
                      </td>
                      <td className="border p-2 text-center">
                        <button
                          className="text-blue-600 hover:underline mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDetail(detail);
                            setDetailModalOpen(true);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(detail.id, "detail");
                          }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setEditingDetail(null);
                    setDetailModalOpen(true);
                  }}
                >
                  + 상세코드 등록
                </button>

                <label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600">
                  엑셀 업로드
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>

                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  onClick={downloadSampleExcel}
                >
                  샘플 다운로드
                </button>
              </div>
            </>
          ) : (
            <p>그룹을 선택해주세요.</p>
          )}
        </div>
      </div>

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        initialData={editingGroup}
        onSave={(group) => {
          if (editingGroup) {
            // 수정
            updateCodeGroup(group.id, group, adminId!)
              .then(() => {
                alert("그룹 코드가 성공적으로 수정되었습니다.");
                loadGroups();
                setGroupModalOpen(false);
              })
              .catch(() => alert("수정 실패"));
          } else {
            // 등록
            createCodeGroup(group, adminId!)
              .then(() => {
                alert("그룹 코드가 성공적으로 등록되었습니다.");
                loadGroups();
                setGroupModalOpen(false);
              })
              .catch(() => alert("등록 실패"));
          }
        }}
      />

      <DetailModal
        key={editingDetail?.codeId ?? "new"}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        initialData={editingDetail}
        codeGroupId={selectedGroup?.codeGroupId ?? ""}
        codeGroupPkId={selectedGroup?.id ?? 0}
        parentCandidates={detailList.filter(
          (d) => d.parentCodeId === null && d.codeId !== editingDetail?.codeId
        )}
        onSave={(detail) => {
          if (editingDetail) {
            updateCodeDetail(detail.id, detail, adminId!)
              .then(() => {
                alert("상세코드가 성공적으로 수정되었습니다.");
                loadAllDetailTree(selectedGroup!.id);
                setDetailModalOpen(false);
              })
              .catch(() => alert("수정 실패"));
          } else {
            // detail에 codeGroupId로 PK 넘겨야 한다
            createCodeDetail(
              {
                ...detail,
                codeGroupId: selectedGroup?.id ?? 0,
              },
              adminId!
            )
              .then(() => {
                alert("상세 코드가 성공적으로 등록 되었습니다.");
                loadAllDetailTree(selectedGroup!.id);
                setDetailModalOpen(false);
              })
              .catch(() => alert("등록 실패"));
          }
        }}
      />
    </AdminLayout>
  );
};

export default CodeManager;

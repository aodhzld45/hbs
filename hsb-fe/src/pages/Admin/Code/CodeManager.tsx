import React, { useEffect, useState } from "react";
import { useAuth } from '../../../context/AuthContext';

import AdminLayout from '../../../components/Layout/AdminLayout';
import { CodeGroup } from "../../../types/Common/CodeGroup";
import { CodeDetail } from "../../../types/Common/CodeDetail";
import {
  fetchCodeGroups,
  createCodeGroup,
  updateCodeGroup,
  deleteCodeGroup,
  fetchParentCodes,
  fetchChildCodes,
  fetchAllDetails,
  createCodeDetail,
  updateCodeDetail,
  deleteCodeDetail
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

  const handleToggleUseTf = async (group: CodeGroup) => {
    try {
      // 토글된 값
      const newUseTf = group.useTf === 'Y' ? 'N' : 'Y';

      // payload 준비
      const payload = {
        id: group.id,
        codeGroupId: group.codeGroupId,
        groupName: group.groupName,
        description: group.description,
        orderSeq: group.orderSeq,
        useTf: newUseTf,
      };

      await updateCodeGroup(group.id, payload, adminId!);

      alert("사용 여부가 변경되었습니다.");
      loadGroups();
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
                <th className="border px-4 py-2">상태</th>
                <th className="border px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {groupList.map((group) => (
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
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleToggleUseTf(group)}
                      className={`px-2 py-1 rounded text-xs ${
                        group.useTf === 'Y'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      } hover:bg-green-200`}
                    >
                      {group.useTf === 'Y' ? '사용' : '미사용'}
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
                      <td className="border p-2">{detail.orderSeq}</td>
                      <td className="border p-2">
                        {detail.useTf === "Y" ? "사용" : "미사용"}
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
              <button
                className="mt-4 bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setEditingDetail(null);
                  setDetailModalOpen(true);
                }}
              >
                + 상세코드 등록
              </button>
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

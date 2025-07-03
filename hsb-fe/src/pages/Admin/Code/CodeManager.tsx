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
  createCodeDetail
 } from "../../../services/Common/CodeApi";

import GroupModal from "../../../components/Admin/Code/GroupModal";
import DetailModal from "../../../components/Admin/Code/DetailModal";

const CodeManager: React.FC = () => {
  const [groupList, setGroupList] = useState<CodeGroup[]>([]);
  const [detailList, setDetailList] = useState<CodeDetail[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
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
        const firstGroupId = res[0].codeGroupId;
        setSelectedGroupId(firstGroupId);
        loadAllDetails(firstGroupId);
      }
    } catch (err) {
      console.error(err);
      alert("그룹 목록 조회 오류");
    } finally {
      setLoadingGroup(false);
    }
  };

  const loadAllDetails = async (groupId: string) => {
    try {
      setLoadingDetail(true);
      const parents = await fetchParentCodes(groupId);
  
      let allDetails: CodeDetail[] = [...parents];
  
      for (const parent of parents) {
        const children = await fetchChildCodes(groupId, parent.codeId);
        allDetails = [...allDetails, ...children];
      }
  
      setDetailList(allDetails);
    } catch (err) {
      console.error(err);
      alert("상세코드 목록 조회 오류");
    } finally {
      setLoadingDetail(false);
    }
  };
  

  useEffect(() => {
    loadGroups();
  }, []);


  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    loadAllDetails(groupId);
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
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">그룹ID</th>
              <th className="border p-2">그룹명</th>
              <th className="border p-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {groupList.map((group) => (
              <tr
                key={group.codeGroupId}
                className={`cursor-pointer ${
                  selectedGroupId === group.codeGroupId
                    ? "bg-blue-100"
                    : ""
                }`}
                onClick={() => handleGroupSelect(group.codeGroupId)}
              >
                <td className="border p-2">{group.codeGroupId}</td>
                <td className="border p-2">{group.groupName}</td>
                <td className="border p-2 text-center">
                  <button className="text-blue-600 hover:underline mr-2">
                    수정
                  </button>
                  <button className="text-red-600 hover:underline">
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
          {selectedGroupId && (
            <span className="ml-2 text-blue-600">
              ({selectedGroupId})
            </span>
          )}
        </h2>

        {selectedGroupId ? (
          <>
            <table className="w-full border text-sm">
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
                    <td className="border p-2">{detail.codeId}</td>
                    <td className="border p-2">
                      {detail.parentCodeId || "-"}
                    </td>
                    <td className="border p-2">{detail.codeNameKo}</td>
                    <td className="border p-2">{detail.codeNameEn}</td>
                    <td className="border p-2">{detail.orderSeq}</td>
                    <td className="border p-2">
                      {detail.useTf === "Y" ? "사용" : "미사용"}
                    </td>
                    <td className="border p-2 text-center">
                      <button className="text-blue-600 hover:underline mr-2">
                        수정
                      </button>
                      <button className="text-red-600 hover:underline">
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
          updateCodeGroup(group.codeGroupId, adminId!)
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
      isOpen={detailModalOpen}
      onClose={() => setDetailModalOpen(false)}
      initialData={editingDetail}
      codeGroupId={selectedGroupId!}
      parentCandidates={detailList.filter(
        (d) => d.parentCodeId === null && d.codeId !== editingDetail?.codeId
      )}
      onSave={(detail) => {
        if (editingDetail) {
          // updateCodeDetail(detail, adminId!)
          //   .then(() => {
          //     alert("수정 완료!");
          //     loadParentDetails(selectedGroupId!);
          //     setDetailModalOpen(false);
          //   })
          //   .catch(() => alert("수정 실패"));
        } else {
          createCodeDetail(detail, adminId!)
            .then(() => {
              alert("상세 코드가 성공적으로 등록 되었습니다.");
              loadAllDetails(selectedGroupId!);
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

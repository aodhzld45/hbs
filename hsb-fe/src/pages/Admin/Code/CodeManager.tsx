import React, { useEffect, useState } from "react";
import AdminLayout from '../../../components/Layout/AdminLayout';

/** 더미 데이터 타입 */
interface CodeGroup {
  codeGroupId: string;
  groupName: string;
  description: string;
  orderSeq: number;
}

interface CodeDetail {
  codeId: string;
  codeGroupId: string;
  parentCodeId: string | null;
  codeNameKo: string;
  codeNameEn: string;
  orderSeq: number;
  useTf: string;
}

/** 더미 데이터 */
const dummyGroups: CodeGroup[] = [
  {
    codeGroupId: "INDUSTRY",
    groupName: "산업분류",
    description: "표준 산업분류",
    orderSeq: 1,
  },
  {
    codeGroupId: "LOCATION",
    groupName: "국가/도시",
    description: "국가 및 도시 코드",
    orderSeq: 2,
  },
];

const dummyDetails: CodeDetail[] = [
  {
    codeId: "A",
    codeGroupId: "INDUSTRY",
    parentCodeId: null,
    codeNameKo: "농업, 임업 및 어업",
    codeNameEn: "Agriculture, Forestry, Fishing",
    orderSeq: 1,
    useTf: "Y",
  },
  {
    codeId: "A01",
    codeGroupId: "INDUSTRY",
    parentCodeId: "A",
    codeNameKo: "농업",
    codeNameEn: "Agriculture",
    orderSeq: 2,
    useTf: "Y",
  },
  {
    codeId: "KR",
    codeGroupId: "LOCATION",
    parentCodeId: null,
    codeNameKo: "대한민국",
    codeNameEn: "Korea",
    orderSeq: 1,
    useTf: "Y",
  },
  {
    codeId: "KR01",
    codeGroupId: "LOCATION",
    parentCodeId: "KR",
    codeNameKo: "서울특별시",
    codeNameEn: "Seoul",
    orderSeq: 2,
    useTf: "Y",
  },
];

const CodeManager: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupList, setGroupList] = useState<CodeGroup[]>([]);
  const [detailList, setDetailList] = useState<CodeDetail[]>([]);

  useEffect(() => {
    // 페이지 초기 로딩 → 그룹 목록 로드
    setGroupList(dummyGroups);

    // 첫 그룹 자동 선택
    if (dummyGroups.length > 0) {
      const firstGroupId = dummyGroups[0].codeGroupId;
      setSelectedGroupId(firstGroupId);
      loadDetails(firstGroupId);
    }
  }, []);

  const loadDetails = (groupId: string) => {
    const details = dummyDetails.filter(
      (item) => item.codeGroupId === groupId
    );
    setDetailList(details);
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    loadDetails(groupId);
  };

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
        <button className="mt-4 bg-blue-500 text-white px-3 py-1 rounded">
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
            <button className="mt-4 bg-green-600 text-white px-3 py-1 rounded">
              + 상세코드 등록
            </button>
          </>
        ) : (
          <p>그룹을 선택해주세요.</p>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default CodeManager;

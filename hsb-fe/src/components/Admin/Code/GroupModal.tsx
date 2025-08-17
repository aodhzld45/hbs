// src/components/Common/GroupModal.tsx
import React, { useEffect, useState } from "react";
import { CodeGroup } from "../../../types/Common/CodeGroup";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: CodeGroup) => void;
  initialData?: CodeGroup | null;
}

const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [id, setId] = useState<number | undefined>(undefined);
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  //const [orderSeq, setOrderSeq] = useState(1);
  const [useTf, setUseTf] = useState("Y");

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setGroupId(initialData.codeGroupId);
      setGroupName(initialData.groupName);
      setDescription(initialData.description);
      //setOrderSeq(initialData.orderSeq);
      setUseTf(initialData.useTf ?? "Y"); // ← 추가!
    } else {
      setId(undefined);
      setGroupId("");
      setGroupName("");
      setDescription("");
      //setOrderSeq(1);
      setUseTf("Y"); // 기본값 Y로 초기화
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({
      id: id ?? 0,                  // 신규 등록 시 id는 0
      codeGroupId: groupId,
      groupName,
      description,
      //orderSeq,
      useTf
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "그룹 수정" : "그룹 등록"}
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">그룹ID</label>
          <input
            type="text"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            //disabled={!!initialData}
            className="border px-2 py-1 w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">그룹명</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">설명</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        {/* <div className="mb-3">
          <label className="block text-sm font-medium">순서</label>
          <input
            type="number"
            value={orderSeq}
            onChange={(e) => setOrderSeq(Number(e.target.value))}
            className="border px-2 py-1 w-full"
          />
        </div> */}

        <div className="mb-3">
            <label className="block text-sm font-medium">사용 여부</label>
            <select
                value={useTf}
                onChange={(e) => setUseTf(e.target.value)}
                className="border px-2 py-1 w-full"
            >
                <option value="Y">사용</option>
                <option value="N">사용안함</option>
            </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;

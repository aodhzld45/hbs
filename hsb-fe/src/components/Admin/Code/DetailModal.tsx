import React, { useEffect, useState } from "react";
import { CodeDetail } from "../../../types/Common/CodeDetail";

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (detail: CodeDetail) => void;
    initialData?: CodeDetail | null;
    codeGroupId: string;
    parentCandidates: CodeDetail[];
  }

  const DetailModal: React.FC<DetailModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    codeGroupId,
    parentCandidates,
  }) => {
    const [codeId, setCodeId] = useState("");
    const [codeNameKo, setCodeNameKo] = useState("");
    const [codeNameEn, setCodeNameEn] = useState("");
    const [parentCodeId, setParentCodeId] = useState<string | null>(null);
    const [orderSeq, setOrderSeq] = useState(1);
    const [useTf, setUseTf] = useState("Y");

    useEffect(() => {
        if (initialData) {
          setCodeId(initialData.codeId);
          setCodeNameKo(initialData.codeNameKo);
          setCodeNameEn(initialData.codeNameEn);
          setParentCodeId(initialData.parentCodeId);
          setOrderSeq(initialData.orderSeq);
          setUseTf(initialData.useTf);
        } else {
          setCodeId("");
          setCodeNameKo("");
          setCodeNameEn("");
          setParentCodeId(null);
          setOrderSeq(1);
          setUseTf("Y");
        }
      }, [initialData]);

      const handleSave = () => {
        onSave({
          codeId,
          codeGroupId,
          parentCodeId,
          codeNameKo,
          codeNameEn,
          orderSeq,
          useTf,
        });
      };

      if (!isOpen) return null;
      return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              {initialData ? "상세코드 수정" : "상세코드 등록"}
            </h2>
    
            <div className="mb-3">
              <label className="block text-sm font-medium">코드ID</label>
              <input
                type="text"
                value={codeId}
                onChange={(e) => setCodeId(e.target.value)}
                disabled={!!initialData}
                className="border px-2 py-1 w-full"
              />
            </div>
    
            <div className="mb-3">
              <label className="block text-sm font-medium">한글명</label>
              <input
                type="text"
                value={codeNameKo}
                onChange={(e) => setCodeNameKo(e.target.value)}
                className="border px-2 py-1 w-full"
              />
            </div>
    
            <div className="mb-3">
              <label className="block text-sm font-medium">영문명</label>
              <input
                type="text"
                value={codeNameEn}
                onChange={(e) => setCodeNameEn(e.target.value)}
                className="border px-2 py-1 w-full"
              />
            </div>
    
            <div className="mb-3">
                <label className="block text-sm font-medium">부모코드</label>
                <select
                    value={parentCodeId || ""}
                    onChange={(e) =>
                    setParentCodeId(e.target.value === "" ? null : e.target.value)
                    }
                    className="border px-2 py-1 w-full"
                >
                    <option value="">없음</option>
                    {parentCandidates.map((item) => (
                    <option key={item.codeId} value={item.codeId}>
                        {item.codeId} - {item.codeNameKo}
                    </option>
                    ))}
                </select>
            </div>
    
            <div className="mb-3">
              <label className="block text-sm font-medium">순서</label>
              <input
                type="number"
                value={orderSeq}
                onChange={(e) => setOrderSeq(Number(e.target.value))}
                className="border px-2 py-1 w-full"
              />
            </div>
    
            <div className="mb-3">
              <label className="block text-sm font-medium">사용여부</label>
              <select
                value={useTf}
                onChange={(e) => setUseTf(e.target.value)}
                className="border px-2 py-1 w-full"
              >
                <option value="Y">사용</option>
                <option value="N">미사용</option>
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
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      );
    };

export default DetailModal;


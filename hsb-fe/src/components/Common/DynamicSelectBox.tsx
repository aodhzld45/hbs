import React, { useEffect, useState } from "react";
import {
  fetchCodeGroups,
  fetchParentCodes,
  fetchChildCodes
} from "../../services/Common/CodeApi";
import { CodeDetail } from "../../types/Common/CodeDetail";
import { CodeGroup } from "../../types/Common/CodeGroup";

export interface DynamicSelectBoxProps {
  group: string;
  levels: {
    label: string;
    value: string | null;
    setValue: (id: string | null) => void;
    selectClassName?: string;
    labelClassName?: string;
    placeholder?: string;
  }[];
}

const DynamicSelectBox: React.FC<DynamicSelectBoxProps> = ({
  group,
  levels,
}) => {
  const [groupPkId, setGroupPkId] = useState<number | null>(null);
  const [optionsList, setOptionsList] = useState<CodeDetail[][]>([]);

  // groupId 조회
  useEffect(() => {
    const loadGroupId = async () => {
      const groups: CodeGroup[] = await fetchCodeGroups();
      const found = groups.find(g => g.codeGroupId === group);
      if (found) {
        setGroupPkId(found.id);
      } else {
        console.warn(`그룹 ${group}을 찾을 수 없습니다.`);
      }
    };
    loadGroupId();
  }, [group]);

  // optionsList 초기화
  useEffect(() => {
    if (groupPkId) {
      fetchParentCodes(groupPkId).then((parents) => {
        setOptionsList([parents]);
        levels[0].setValue(null);
        levels.slice(1).forEach(l => l.setValue(null));
      });
    }
  }, [groupPkId]);

  // 자식코드 동적 로드
  useEffect(() => {
    if (!groupPkId) return;
    const loadChildren = async () => {
      const newOptionsList: CodeDetail[][] = [...optionsList];

      for (let i = 0; i < levels.length - 1; i++) {
        const currentValue = levels[i].value;
        if (currentValue) {
          const children = await fetchChildCodes(groupPkId, currentValue);
          newOptionsList[i + 1] = children;
        } else {
          newOptionsList.splice(i + 1);
          break;
        }
      }
      setOptionsList(newOptionsList);
    };
    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels.map(l => l.value).join(",")]);

  const handleChange = (levelIdx: number, value: string) => {
    levels[levelIdx].setValue(value || null);
    for (let j = levelIdx + 1; j < levels.length; j++) {
      levels[j].setValue(null);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      {levels.map((level, idx) => {
        const options = optionsList[idx] || [];
        const disabled = idx > 0 && !levels[idx - 1].value;

        return (
          <div key={idx}>
            <label
              className={level.labelClassName || "text-sm text-gray-700 mb-1"}
            >
              {level.label}
            </label>
            <select
              value={level.value || ""}
              onChange={e => handleChange(idx, e.target.value)}
              className={level.selectClassName || "border p-2 rounded w-full"}
              disabled={disabled || !options.length}
            >
              <option value="">
                {level.placeholder || "선택하세요"}
              </option>
              {options.map(opt => (
                <option key={opt.codeId} value={opt.codeId}>
                  {opt.codeNameKo} ({opt.codeId})
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};

export default DynamicSelectBox;

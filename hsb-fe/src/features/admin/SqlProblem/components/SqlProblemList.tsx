import React, { FormEvent } from 'react';
import { ProblemItem } from '../types/ProblemItem';
import SearchInput from '../../Common/SearchInput'; // ← 공통 경로에 맞게 import 경로 조정하세요
import Pagination from '../../../../components/Common/Pagination';

type ListState = {
  items: ProblemItem[];
  keyword: string;
  level?: number;
  rule?: 'SELECT_ONLY' | 'DML_ALLOWED';
  useTf?: 'Y' | 'N';
  page: number;
  size: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
};

type ListActions = {
  setKeyword: (v: string) => void;
  setLevel: (v: number | undefined) => void;
  setRule: (v: 'SELECT_ONLY' | 'DML_ALLOWED' | undefined) => void;
  setUseTf: (v: 'Y' | 'N' | undefined) => void;
  setPage: (v: number) => void;
  search: (opts?: { resetPage?: boolean }) => Promise<void> | void;
};

type Props = {
  state: ListState;
  actions: ListActions;
  onEdit: (item: ProblemItem) => void;
  onDelete: (id: number) => void;
  onToggleUse: (id: number, next: 'Y' | 'N') => void;
  onDetail?: (item: ProblemItem) => void;
};

const SqlProblemList: React.FC<Props> = ({ state, actions, onEdit, onDelete, onToggleUse, onDetail }) => {
  const {
    items, keyword, level, rule, useTf, page, totalPages, totalCount, loading,
  } = state;

/** 키워드 검색 트리거 (Enter/버튼) */
const triggerSearch = async () => {
    await actions.search({ resetPage: true });
};

  /** 나머지 필터 적용용 submit */
const onSubmitFilters = async (e: FormEvent) => {
    e.preventDefault();
    await triggerSearch();
};


  
  return (
    <div className="space-y-3">
    {/* 검색/필터 카드 */}
    <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* 총 개수 뱃지 */}
            <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                총 {totalCount}개
            </span>
            </div>

            {/* 검색 + 필터 툴바 */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* 공통 검색 */}
            <SearchInput
                value={keyword}
                onChange={actions.setKeyword}
                onSearch={triggerSearch}
                placeholder="제목 검색어"
                className="w-64"
            />

            {/* 구분선 */}
            <span className="hidden h-6 w-px bg-gray-200 md:block" />

            {/* 레벨 */}
            <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">레벨</label>
                <input
                className="input-field w-24"
                placeholder="예: 1"
                type="number"
                value={level ?? ''}
                onChange={(e) => actions.setLevel(e.target.value ? Number(e.target.value) : undefined)}
                />
            </div>

            {/* 규칙 */}
            <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">규칙</label>
                <select
                className="select-field w-36"
                value={rule ?? ''}
                onChange={(e) =>
                    actions.setRule(e.target.value ? (e.target.value as 'SELECT_ONLY' | 'DML_ALLOWED') : undefined)
                }
                >
                <option value="">전체</option>
                <option value="SELECT_ONLY">SELECT_ONLY</option>
                <option value="DML_ALLOWED">DML_ALLOWED</option>
                </select>
            </div>

            {/* 사용 여부 */}
            <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">사용</label>
                <select
                className="select-field w-28"
                value={useTf ?? ''}
                onChange={(e) => actions.setUseTf(e.target.value ? (e.target.value as 'Y' | 'N') : undefined)}
                >
                <option value="">전체</option>
                <option value="Y">Y</option>
                <option value="N">N</option>
                </select>
            </div>

            {/* 액션 */}
            <form onSubmit={onSubmitFilters} className="flex items-center gap-2">
                <button className="button-secondary" type="submit" disabled={loading}>
                {loading ? '검색중…' : '필터 적용'}
                </button>
                <button
                type="button"
                className="button-ghost"
                onClick={async () => {
                    actions.setKeyword('');
                    actions.setLevel(undefined);
                    actions.setRule(undefined);
                    actions.setUseTf(undefined);
                    await triggerSearch();
                }}
                >
                초기화
                </button>
            </form>
            </div>
        </div>
    </div>


      {/* 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">제목</th>
              <th className="p-2 border">레벨</th>
              <th className="p-2 border">규칙</th>
              <th className="p-2 border">등록일</th>
              <th className="p-2 border">사용 여부</th>
              <th className="p-2 border">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2 border text-center">{it.id}</td>
                <td className="p-2 border">
                  {onDetail ? (
                    <button className="text-blue-600 hover:underline" onClick={() => onDetail(it)}>
                      {it.title}
                    </button>
                  ) : (
                    it.title
                  )}
                </td>
                <td className="p-2 border text-center">{it.level ?? '-'}</td>
                <td className="p-2 border text-center">{it.constraintRule ?? '-'}</td>
                <td className="p-2 border text-center">
                  {it.regDate ? it.regDate.slice(0, 10) : '-'}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => onToggleUse(it.id, it.useTf === 'Y' ? 'N' : 'Y')}
                    className={`px-2 py-1 rounded text-xs ${
                      it.useTf === 'Y'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    } hover:bg-green-200`}
                  >
                    {it.useTf === 'Y' ? '사용' : '미사용'}
                  </button>
                </td>
                <td className="p-2 border text-center">
                  <button className="button-secondary mr-2" onClick={() => onEdit(it)}>
                    수정
                  </button>
                  
                  <button className="button-danger" onClick={() => onDelete(it.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이징 */}
    <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={actions.setPage}
    />
    </div>
  );
};

export default SqlProblemList;

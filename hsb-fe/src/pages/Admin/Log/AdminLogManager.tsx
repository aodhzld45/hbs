import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { format } from 'date-fns';
import Pagination from '../../../components/Common/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
    AdminLogItem,
    AdminLogSearchParams,
  } from '../../../types/Admin/AdminLogItem';
import { fetchAdminLogList } from '../../../services/Admin/adminLogApi';

const AdminLogManager = () => {

    const [logs, setLogs] = useState<AdminLogItem[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [size] = useState(10); // 한 페이지에 보여줄 게시물 수 지정
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const loadLogList = async () => {
        try {
          setIsLoading(true);
          const res = await fetchAdminLogList({
            keyword,
            page,
            size,
            start: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
            end: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
          });
          console.log(res);
          setLogs(res.items);
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
        } catch (err) {
          console.error(err);
          alert('관리자 로그 조회 실패');
        } finally {
          setIsLoading(false);
        }
      };

    useEffect(() => {
    loadLogList();
    }, [page, keyword, startDate, endDate]);

    const handleExcelDownload = () => {
        alert("엑셀 다운로드 구현 예정");
    };

  return (

    <AdminLayout>
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          관리자 로그 관리
        </h2>

        {/* 검색 영역 */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <span className="text-gray-700">총 {totalCount}개</span>

          <div className="flex gap-2 flex-wrap">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="시작일"
              className="border px-3 py-2 rounded"
            />

            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="종료일"
              className="border px-3 py-2 rounded"
            />

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  loadLogList();
                }
              }}
              placeholder="관리자ID, 액션 검색"
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={() => {
                setPage(0);
                loadLogList();
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              검색
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">No</th>
              <th className="border p-2">관리자ID</th>
              <th className="border p-2">액션</th>
              <th className="border p-2">상세</th>
              <th className="border p-2">URL</th>
              <th className="border p-2">IP</th>
              <th className="border p-2">로그일시</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  로그가 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log.id} className="text-center hover:bg-gray-50 text-sm">
                  <td className="border p-2">
                    {totalCount - (page * size + idx)}
                  </td>
                  <td className="border p-2">{log.adminId}</td>
                  <td className="border p-2">{log.action}</td>
                  <td className="border p-2 text-left">{log.detail}</td>
                  <td className="border p-2 text-left text-blue-600">{log.url}</td>
                  <td className="border p-2">{log.ip}</td>
                  <td className="border p-2">
                    {format(new Date(log.logDate), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleExcelDownload}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            검색결과 엑셀 다운로드
          </button>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  )
}

export default AdminLogManager
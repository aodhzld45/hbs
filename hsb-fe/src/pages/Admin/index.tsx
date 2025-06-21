// src/pages/Admin/Index.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import { fetchContentStats } from '../../services/Admin/statsApi';
//import { fetchDashboardStats } from '../../services/Admin/statApi'; 
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const AdminIndex = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState<Date>(dayjs().subtract(30, 'day').toDate());
  const [endDate, setEndDate] = useState<Date>(new Date());
  // 콘텐츠 통계 상태 값
  const [monthlyLabels, setMonthlyLabels] = useState<string[]>([]);
  const [contentStats, setContentStats] = useState<number[]>([]);
  
  const [typeLabels, setTypeLabels] = useState<string[]>([]);
  const [typeRatio, setTypeRatio] = useState<number[]>([]);
  //
  const [popularViews, setPopularViews] = useState<number[]>([]);
  const [commentStats, setCommentStats] = useState<number[]>([]);
  const [visitorStats, setVisitorStats] = useState<number[]>([]);

  const loadStats = async () => {
    try {
      const res = await fetchContentStats(startDate, endDate);
      console.log(res);

      // 월별 콘텐츠 업로드
      setMonthlyLabels(res.monthlyStats.map((s: any) => s.month));
      setContentStats(res.monthlyStats.map((s: any) => s.count));

      // 콘텐츠 타입 비율
      if (Array.isArray(res.ContentTypeRatios)) {
        setTypeLabels(res.ContentTypeRatios.map((r: any) => r.contentType));
        setTypeRatio(res.ContentTypeRatios.map((r: any) => r.count));
      }

    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  // const loadStats = async () => {
  //   // 더미 데이터 적용
  //   setTypeRatio([60, 25, 15]); // 영상, 문서, 이미지 비율
  //   setPopularViews([1800, 1500, 1200, 900, 700]); // 조회수 TOP5
  //   setCommentStats([12, 20, 18, 25]); // 댓글 수
  //   setVisitorStats([50, 80, 65, 90]); // 방문자 수
  // };

  useEffect(() => {
    loadStats();
  }, [startDate, endDate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📊 통합 통계 대시보드</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            로그아웃
          </button>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => {
                if (date) setStartDate(date);
              }}
              dateFormat="yyyy-MM-dd"
              maxDate={endDate}
            />
          <span>~</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => {
              if (date) setEndDate(date);
            }} 
            dateFormat="yyyy-MM-dd"
            minDate={startDate}
          />
          <button
            onClick={loadStats}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            조회
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">월별 콘텐츠 업로드</h3>
            <Line
              data={{
                labels: monthlyLabels,
                datasets: [
                  {
                    label: '건수',
                    data: contentStats,
                    borderColor: '#3b82f6',
                    backgroundColor: '#bfdbfe',
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">콘텐츠 유형 비율</h3>
            <Pie
              data={{
                labels: typeLabels,
                datasets: [
                  {
                    data: typeRatio,
                    backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444'],
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">인기 콘텐츠 TOP5</h3>
            <Bar
              data={{
                labels: ['1위', '2위', '3위', '4위', '5위'],
                datasets: [
                  {
                    label: '조회수',
                    data: popularViews,
                    backgroundColor: '#60a5fa',
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">최근 댓글 활동</h3>
            <Line
              data={{
                labels: ['-30일', '-20일', '-10일', '오늘'],
                datasets: [
                  {
                    label: '댓글 수',
                    data: commentStats,
                    borderColor: '#10b981',
                    backgroundColor: '#6ee7b7',
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-4 rounded shadow col-span-2">
            <h3 className="font-semibold mb-2">최근 방문자 수</h3>
            <Line
              data={{
                labels: ['-30일', '-20일', '-10일', '오늘'],
                datasets: [
                  {
                    label: '방문자',
                    data: visitorStats,
                    borderColor: '#6366f1',
                    backgroundColor: '#c7d2fe',
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIndex;

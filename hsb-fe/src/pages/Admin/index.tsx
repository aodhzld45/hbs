// src/pages/Admin/Index.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale'; // 한글 locale
import 'react-datepicker/dist/react-datepicker.css';
import { Line, Pie, Bar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import { fetchContentStats, fetchCommentStats } from '../../services/Admin/statsApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
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

  const [popularLabels, setPopularLabels] = useState<string[]>([]);
  const [popularViews, setPopularViews] = useState<number[]>([]);
  //

  // 댓글 통계 상태 값
  const [commentLabels, setCommentLabels] = useState<string[]>([]);
  const [commentCounts, setCommentCounts] = useState<number[]>([]);

  const [visitorStats, setVisitorStats] = useState<number[]>([]);

  const loadStats = async () => {
    try {
      // 콘텐츠 통계
      const res = await fetchContentStats(startDate, endDate);

      // 월별 콘텐츠 업로드
      setMonthlyLabels(res.monthlyStats.map((s: any) => s.month));
      setContentStats(res.monthlyStats.map((s: any) => s.count));

      // 콘텐츠 타입 비율
      if (Array.isArray(res.contentTypeRatios)) {
        setTypeLabels(res.contentTypeRatios.map((r: any) => r.contentType));
        setTypeRatio(res.contentTypeRatios.map((r: any) => r.count));
      }

      // 인기 콘텐츠 TOP5
      if (Array.isArray(res.contentPopular)) {
        setPopularLabels(res.contentPopular.map((p: any) => p.title));
        setPopularViews(res.contentPopular.map((p: any) => p.viewCount));
      }

      // 댓글 통계

      const commentRes = await fetchCommentStats(startDate, endDate);

      // 댓글 대상 유형별 
      if (Array.isArray(commentRes.commentTarget)) {
        setCommentLabels(
          commentRes.commentTarget.map((item: any) => {
            switch (item.targetType) {
              case 'BOARD': return '게시판';
              case 'CONTENT': return '콘텐츠';
              default: return item.targetType;
            }
          })
        );

        setCommentCounts(commentRes.commentTarget.map((item: any) => item.commentCount));
      }    

    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };


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
          <h1 className="text-3xl font-bold">📊 통합 대시보드</h1>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => {
                if (date) setStartDate(date);
              }}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              maxDate={endDate}
            />
          <span>~</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => {
              if (date) setEndDate(date);
            }}
            locale={ko} 
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
            <h3 className="text-xl font-bold mb-4">월별 콘텐츠 업로드</h3>
            {contentStats.length > 0 ? (
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
          ) : (
            <div className="text-gray-500 text-center py-10">데이터가 없습니다</div>
          )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-bold mb-4">콘텐츠 유형 비율</h3>
            {typeRatio.length > 0 ? (
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
            ) : (
              <div className="text-gray-500 text-center py-10">데이터가 없습니다</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">인기 콘텐츠 TOP5</h3>
            {popularViews.length > 0 ? (
            <Bar
              data={{
                labels: popularLabels,
                datasets: [
                  {
                    label: '조회수',
                    data: popularViews,
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.7)',   // blue
                      'rgba(34, 197, 94, 0.7)',    // green
                      'rgba(234, 179, 8, 0.7)',    // yellow
                      'rgba(239, 68, 68, 0.7)',    // red
                      'rgba(168, 85, 247, 0.7)',   // purple
                    ],                    borderRadius: 6,
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `조회수: ${context.raw}회`,
                    },
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 0,
                      minRotation: 0,
                      callback: (value, index) => {
                        const label = popularLabels[index];
                        return label.length > 10 ? label.slice(0, 10) + '…' : label;
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 5,
                    },
                    grid: {
                      color: '#eee',
                    },
                  },
                },
              }}
            />
            ) : (
              <div className="text-gray-500 text-center py-10">데이터가 없습니다</div>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">댓글 대상 유형 통계</h3>
            {commentCounts.length > 0 ? (
            <PolarArea
              data={{
                labels: commentLabels,
                datasets: [
                  {
                    label: '댓글 수',
                    data: commentCounts,
                    backgroundColor: [
                      '#60a5fa', // blue
                      '#34d399', // green
                      '#fbbf24', // yellow
                      '#f87171', // red
                    ],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
            ) : (
              <div className="text-gray-500 text-center py-10">데이터가 없습니다</div>
            )}
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

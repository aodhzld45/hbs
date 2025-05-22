import React from 'react';
import { FileText, Users2, Star, Activity } from 'lucide-react';
import Layout from '../components/Layout/Layout';

const MainPage = () => {
  return (
    <Layout>
      <div className="bg-white w-full text-center py-16 px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366] mb-4">
          효성 사내 콘텐츠 플랫폼
        </h1>
        <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          효성인의 소통과 협업을 위한 디지털 허브입니다. 공지사항, 홍보자료, 이벤트, 콘텐츠를 통합 관리하세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 max-w-5xl mx-auto">
          <Card icon={<FileText size={24} />} title="공지사항 관리" desc="중요한 사내 공지와 알림을 빠르게 확인하고 관리할 수 있습니다." />
          <Card icon={<Users2 size={24} />} title="홍보자료 등록" desc="이미지, 영상, 문서 등의 브랜드 콘텐츠를 업로드하고 배포합니다." />
          <Card icon={<Star size={24} />} title="이벤트 게시판" desc="사내 이벤트 및 칭찬 릴레이 등 임직원 참여형 게시판 운영" />
          <Card icon={<Activity size={24} />} title="통계 및 로그" desc="사용자 활동 및 콘텐츠 접속 이력을 분석하여 활용할 수 있습니다." />
        </div>

        <div className="mt-16">
          <p className="text-lg font-semibold text-gray-700 mb-4">오늘의 추천 콘텐츠</p>
          <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/_g1XBLBZTmA"
              title="사내 콘텐츠 영상"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Card = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border transition text-left">
    <div className="flex items-center gap-3 text-[#003366] mb-2">
      <div className="p-2 bg-[#f0f4f8] rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">
      {desc}
    </p>
  </div>
);

export default MainPage;

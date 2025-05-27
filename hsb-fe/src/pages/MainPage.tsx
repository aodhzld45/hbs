import React from 'react';
import { Code, ServerCog, ClipboardList, BarChart4 } from 'lucide-react';
import Layout from '../components/Layout/Layout';

const MainPage = () => {

  return (
    <Layout>
      {/* About Me Section */}
      <section className="bg-white text-gray-800 dark:bg-[#1a1a1a] dark:text-white py-16 px-4 md:px-8 border-b">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src="/image/seo.jpg"
            alt="서현석 프로필"
            className="w-40 h-52 rounded-md object-cover border"
          />

          <div>
            <h2 className="text-2xl font-bold mb-3">
              안녕하세요! <span className="text-blue-600 dark:text-blue-400">풀스택 개발자 서현석</span>입니다
            </h2>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
              <li>🎂 1994.10.13</li>
              <li>📞 010-5038-4722</li>
              <li>📧 aodhzld45@gmail.com</li>
            </ul>

            <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-4 shadow-sm mb-3">
              <p className="font-semibold mb-1">끈기 있는 개발자</p>
              <p className="text-sm leading-relaxed">
                다양한 프로젝트에서 문제 해결 중심으로 접근하며, 실무에서의 안정성과 효율성을 항상 고민합니다.
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-4 shadow-sm">
              <p className="font-semibold mb-1">꾸준히 성장하는 개발자</p>
              <p className="text-sm leading-relaxed">
                새로운 기술에 대한 흥미와 함께, 직접 구축하고 운영하는 과정을 통해 기술을 체득하고 성장합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 프로젝트 카드 섹션 */}
      <div className="bg-white dark:bg-[#121212] w-full text-center py-16 px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366] dark:text-blue-300 mb-4">
          HBS 프로젝트
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          풀스택 개발자로서 직접 설계하고 운영한 콘텐츠 통합 플랫폼입니다.
          실무 경험 기반으로 콘텐츠 관리, 권한 제어, 로그 분석 기능을 포함합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 max-w-5xl mx-auto">
          <Card icon={<ClipboardList size={24} />} title="원주미래산업진흥원 구축" desc="PHP 기반 CMS 구축 및 회원/예약/팝업 관리 기능 개발 (2024.11~01)" />
          <Card icon={<ClipboardList size={24} />} title="SKT OUR365 CONNECT+ 운영 및 유지보수" desc="SKT 사내방송 플랫폼(GBS) 운영 요건 개발 및 로그 관련 개발 (2024.08~ 2025.03)" />
          <Card icon={<Code size={24} />} title="천조 키오스크 및 API 유지보수" desc="스타필드/센텀시티 키오스크 및 엘리베이터 디스플레이 개선 (2024.05~07)" />
          <Card icon={<ServerCog size={24} />} title="스마일게이트 교육플랫폼 고도화 및 유지보수" desc="Chart.js를 활용한 통계화면 개발, 시험/설문 기능 유지보수 (2024.01~03, 06~12)" />
          <Card icon={<BarChart4 size={24} />} title="한양대학교 입학처 리뉴얼" desc="수시, 정시, 재외국민, 편입학 페이지 개발 및 유지보수 (2022.03~05)" />
          <Card icon={<ServerCog size={24} />} title="대통령경호처 인재채용사이트" desc="[인턴십] CentOS 기반 인재채용 시스템의 서버 관리 및 유지보수 (2020.11~2021.01)" />
        </div>

        <div className="mt-16">
          <p className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
            보유 역량 및 관심 기술
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-white max-w-5xl mx-auto">
            <SkillBadge label="Java / Spring Boot / JPA" />
            <SkillBadge label="React / TypeScript / Axios" />
            <SkillBadge label="MySQL / MariaDB / MSSQL" />
            <SkillBadge label="Linux / Apache / Tomcat" />
            <SkillBadge label="Git / GitHub Actions / Jenkins" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Card = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-6 rounded-2xl shadow-sm hover:shadow-md border transition text-left">
    <div className="flex items-center gap-3 text-[#003366] dark:text-blue-300 mb-2">
      <div className="p-2 bg-[#f0f4f8] dark:bg-gray-700 rounded-full">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
  </div>
);

const SkillBadge = ({ label }: { label: string }) => (
  <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-full text-center font-medium">
    {label}
  </div>
);

export default MainPage;

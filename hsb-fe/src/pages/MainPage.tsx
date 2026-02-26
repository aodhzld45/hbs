import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Code, ServerCog, ClipboardList, BarChart4 } from 'lucide-react';
import { motion } from 'framer-motion';

import Layout from '../components/Layout/Layout';

import SideNav from '../components/Common/SideNav';
import IntroSection from '../components/Common/IntroSection';
import DeploySection from '../components/Common/DeploySection';
import SecuritiesDataSection from '../components/Common/SecuritiesDataSection';
import { SkillGroup, TechIcon } from '../components/Common/SkillGroup';
import ProjectDetailModal, { type ProjectDetail } from '../components/Common/ProjectDetailModal';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { PopupBannerItem } from '../types/Admin/PopupBannerItem';
import { fetchVisiblePopupBanners } from '../services/Admin/popupBannerApi';
import { FILE_BASE_URL } from '../config/config';
import { fetchPageByUrl } from '../services/Admin/pageApi';
import { fetchPageSectonList } from '../services/Admin/pageSectionApi';
import { Block, PageSectionItem } from '../types/Admin/PageSectionItem';
import DynamicSection from './Admin/Page/DynamicSection';

import Assistant from '../features/user/OpenAI';

const POPUP_HIDE_KEY = 'hsbs_popup_hide_date';

/** 경력기술서 기반 프로젝트 (Slider Carousel + 상세 모달). public/image/main 이미지 활용 */
const PROJECTS: Array<{
  icon: typeof ClipboardList;
  title: string;
  desc: string;
  period: string;
  platform: string;
  stack: string[];
  /** 슬라이더 카드 상단 썸네일 (없으면 아이콘만) */
  coverImage?: string;
  detail: ProjectDetail;
}> = [
  {
    icon: ClipboardList,
    title: '원주미래산업진흥원 구축',
    desc: 'PHP 기반 CMS 구축 및 회원/예약/팝업 관리 기능 개발',
    period: '2024.11 ~ 2025.01',
    platform: 'Web',
    stack: ['PHP', 'MySQL','CMS'],
    coverImage: '/image/main/wonju01.png',
    detail: {
      id: 'wonju',
      title: '원주미래산업진흥원 구축',
      period: '2024.11 ~ 2025.01',
      platform: 'Web',
      role: '웹 개발',
      summary: '원주미래산업진흥원 공식 사이트 구축. PHP 기반 CMS로 회원·예약·팝업 관리 기능을 개발하고 운영 환경을 구성했습니다.',
      bullets: ['PHP 기반 CMS 구축 및 커스터마이징', '회원 가입/로그인 및 예약 시스템 연동', '팝업·배너 관리 기능 개발', '반응형 UI 및 접근성 반영'],
      stack: ['PHP', 'MySQL','CMS'],
      images: ['/image/main/wonju01.png', '/image/main/wonju02.png', '/image/main/wonju03.png', '/image/main/wonju04.png'],
    },
  },
  {
    icon: ClipboardList,
    title: 'SKT OUR365 CONNECT+ 운영 및 유지보수',
    desc: 'SKT 사내방송 플랫폼(GBS) 운영 요건 개발 및 로그 관련 개발',
    period: '2024.08 ~ 2025.03',
    platform: 'Web',
    stack: ['Mustache', 'SpringBoot', 'Java', 'MSSQL'],
    coverImage: '/image/main/our365_01.png',
    detail: {
      id: 'skt',
      title: 'SKT OUR365 CONNECT+ 운영 및 유지보수',
      period: '2024.08 ~ 2025.03',
      platform: 'Web',
      role: '풀스택 개발',
      summary: 'SKT 사내방송 플랫폼(GBS)의 운영 요건 개발 및 로그·모니터링 관련 기능을 담당했습니다.',
      bullets: ['GBS 플랫폼 운영 요건 개발', '로그 수집 및 분석 기능 개발', '프론트/백엔드 유지보수'],
      stack: ['Mustache', 'SpringBoot', 'Java', 'MSSQL'],
      images: ['/image/main/our365_01.png', '/image/main/our365_02.png', '/image/main/our365_03.png'],
    },
  },
  {
    icon: Code,
    title: '천조 키오스크 및 API 유지보수',
    desc: '스타필드/센텀시티 키오스크 및 엘리베이터 디스플레이 개선',
    period: '2024.05 ~ 2024.07',
    platform: 'Display, Kiosk, Web',
    stack: ['PHP', 'C#', 'REST API'],
    coverImage: '/image/main/starcity01.png',
    detail: {
      id: 'cheonjo',
      title: '천조 키오스크 및 API 유지보수',
      period: '2024.05 ~ 2024.07',
      platform: 'Web, APP-SW',
      role: '키오스크/API 개발',
      summary: '스타필드·센텀시티 등 쇼핑몰 키오스크 및 엘리베이터 디스플레이 UI/동작 개선과 API 유지보수를 수행했습니다.',
      bullets: ['키오스크 UI 및 플로우, 비즈니스 로직 개선', '엘리베이터 디스플레이 연동', 'REST API 유지보수 및 문서화'],
      stack: ['PHP', 'C#', 'REST API'],
      images: ['/image/main/starcity01.png', '/image/main/startcity02.png'],
    },
  },
  {
    icon: ServerCog,
    title: '스마일게이트 교육플랫폼 고도화 및 유지보수',
    desc: 'Chart.js를 활용한 통계화면 개발, 시험/설문 기능 유지보수',
    period: '2024.01 ~ 2024.12',
    platform: 'Web',
    stack: ['JSP Jquery','MSSQL', 'Spring', 'Chart.js'],
    coverImage: '/image/main/smilegate01.png',
    detail: {
      id: 'smilegate',
      title: '스마일게이트 교육플랫폼 고도화 및 유지보수',
      period: '2024.01 ~ 2024.12',
      platform: 'Web',
      role: '프론트엔드 개발',
      summary: '사내 교육플랫폼의 통계 대시보드와 시험·설문 기능을 개발·유지보수했습니다.',
      bullets: ['Chart.js 기반 통계 화면 개발', '시험·설문 모듈 유지보수', '사용자 경험 개선 및 버그 수정'],
      stack: ['JSP jQuery','MSSQL', 'Spring', 'Chart.js'],
      images: ['/image/main/smilegate01.png', '/image/main/smilegate02.png', ],
    },
  },
  {
    icon: BarChart4,
    title: '한양대학교 입학처 리뉴얼',
    desc: '수시, 정시, 재외국민, 편입학 페이지 개발 및 유지보수',
    period: '2024.03 ~ 2024.05',
    platform: 'Web',
    stack: ['JSP jQuery', 'Oracle', 'Spring'],
    coverImage: '/image/main/hanyang01.png',
    detail: {
      id: 'hanyang',
      title: '한양대학교 입학처 리뉴얼',
      period: '2024.03 ~ 2024.05',
      platform: 'Web',
      role: '웹 퍼블리싱·개발',
      summary: '한양대 입학처 사이트 리뉴얼에 참여하여 수시·정시·재외국민·편입학 관련 페이지를 개발했습니다.',
      bullets: ['신청프로그램 및 교사 간담회 고도화', '반응형 레이아웃 및 접근성 적용', '기존 CMS 연동'],
      stack: ['jQuery', 'Spirng', 'MyBatis', 'Oracle'],
      images: ['/image/main/hanyang01.png','/image/main/hanyang02.png','/image/main/hanyang03.png'],
    },
  },
  {
    icon: ServerCog,
    title: '대통령경호처 인재채용사이트',
    desc: '[인턴십] CentOS 기반 인재채용 시스템의 서버 관리 및 유지보수',
    period: '2020.11 ~ 2021.01',
    platform: 'Web',
    stack: ['CentOS', 'Linux'],
    coverImage: '/image/main/pss01.png',
    detail: {
      id: 'presidency',
      title: '대통령경호처 인재채용사이트',
      period: '2020.11 ~ 2021.01',
      platform: 'infra, Web',
      role: '인턴십 · 서버 관리',
      summary: '인재채용 전용 시스템의 CentOS 서버 운영, 배포 및 유지보수를 담당했습니다.',
      bullets: ['CentOS 서버 환경 구성 및 관리', '배포 스크립트 및 모니터링', '보안 패치 및 로그 점검'],
      stack: ['CentOS', 'Linux', 'Apache', 'MySQL'],
      images: ['/image/main/pss01.png'],


    },
  },
];

const SECTION_CLASS = 'scroll-mt-24 py-20 px-4 md:px-8 border-t';
const SECTION_TITLE_CLASS = 'text-2xl md:text-3xl font-bold text-gray-800 dark:text-white inline-block border-b-4 border-blue-600 pb-2';

function isPopupHiddenToday(): boolean {
  try {
    const stored = localStorage.getItem(POPUP_HIDE_KEY);
    const today = new Date().toISOString().slice(0, 10);
    return stored === today;
  } catch {
    return false;
  }
}

const MainPage = () => {
  const location = useLocation();
  const [bannerPopups, setBannerPopups] = useState<PopupBannerItem[]>([]);
  const [popupPopups, setPopupPopups] = useState<PopupBannerItem[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showSideNav, setShowSideNav] = useState(false);
  const [sections, setSections] = useState<PageSectionItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);

  const handleClosePopup = () => setIsPopupOpen(false);
  const handleCloseProjectModal = () => setSelectedProject(null);

  const handleClosePopupToday = () => {
    try {
      localStorage.setItem(POPUP_HIDE_KEY, new Date().toISOString().slice(0, 10));
    } catch {
      // ignore
    }
    setIsPopupOpen(false);
  };

  const loadPopupBanners = useCallback(async () => {
    try {
      const res = await fetchVisiblePopupBanners();
      const filtered = res.filter((p) => p.useTf === 'Y');
      setBannerPopups(filtered.filter((p) => p.type === 'banner'));
      const popupList = filtered.filter((p) => p.type === 'popup');
      setPopupPopups(popupList);
      if (popupList.length > 0 && !isPopupHiddenToday()) setIsPopupOpen(true);
    } catch (e) {
      console.error('팝업 로딩 실패', e);
    }
  }, []);

  const loadSections = useCallback(async () => {
    try {
      const pageRes = await fetchPageByUrl(location.pathname);
      const res = await fetchPageSectonList(pageRes.id, '', 0, 10, 'Y');
      const fileMap = (section: PageSectionItem) => {
        const map = new Map<string, string>();
        (section.files ?? []).forEach((f) => map.set(f.originalFileName, f.filePath));
        return map;
      };
      const mapBlockSrc = (blocks: Block[] = [], section: PageSectionItem) =>
        (blocks ?? []).map((block) => {
          if ((block.type !== 'IMAGE' && block.type !== 'VIDEO') || (typeof block.src === 'string' && block.src?.trim())) return block;
          const src = fileMap(section).get(block.label ?? '');
          return { ...block, src: src ? `${FILE_BASE_URL}${src}` : undefined };
        });
      const parsed = res.items.map((section: PageSectionItem) => {
        const parsedJson = typeof section.optionJson === 'string' ? JSON.parse(section.optionJson) : section.optionJson;
        return {
          ...section,
          optionJson: {
            ...parsedJson,
            left: mapBlockSrc(parsedJson?.left, section),
            right: mapBlockSrc(parsedJson?.right, section),
          },
          files: section.files ?? [],
        };
      });
      setSections(parsed);
    } catch (error) {
      console.error('페이지 섹션 조회 실패', error);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const top = aboutEl.getBoundingClientRect().top;
        setShowSideNav(top <= window.innerHeight / 2);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadPopupBanners();
    loadSections();
  }, [loadPopupBanners, loadSections]);

  return (
    <Layout>
      <div className="w-full overflow-x-hidden">
        <IntroSection />
        {showSideNav && <SideNav />}
        <Assistant />
        <ProjectDetailModal project={selectedProject} onClose={handleCloseProjectModal} />

        {/* About */}
        <motion.section
          id="about"
          className={`${SECTION_CLASS} bg-white text-gray-800 dark:bg-[#1a1a1a] dark:text-white`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className={SECTION_TITLE_CLASS}>📌 ABOUT</h2>
          </div>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12">
            <motion.img
              src="/image/seo.jpg"
              alt="서현석 프로필"
              className="w-40 h-52 rounded-md object-cover border shadow-md"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
            <motion.div
              className="max-w-xl"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-3 text-center md:text-left">
                안녕하세요! <span className="text-blue-600 dark:text-blue-400">풀스택 개발자 서현석</span> 입니다
              </h2>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4 text-center md:text-left">
                <li>🎂 1994.10.13</li>
                <li>📞 010-5038-4722</li>
                <li>📧 aodhzld45@gmail.com</li>
              </ul>
              <div className="space-y-4">
                <motion.div
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-4 shadow-sm"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <p className="font-semibold mb-1">끈기 있는 개발자</p>
                  <p className="text-sm leading-relaxed">다양한 프로젝트에서 문제 해결 중심으로 접근하며, 실무에서의 안정성과 효율성을 항상 고민합니다.</p>
                </motion.div>
                <motion.div
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-4 shadow-sm"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <p className="font-semibold mb-1">꾸준히 성장하는 개발자</p>
                  <p className="text-sm leading-relaxed">새로운 기술에 대한 흥미와 함께, 직접 구축하고 운영하는 과정을 통해 기술을 체득하고 성장합니다.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Engineering Philosophy */}
        <motion.section
          id="philosophy"
          className={`${SECTION_CLASS} bg-white dark:bg-[#121212] text-gray-800 dark:text-white`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className={SECTION_TITLE_CLASS}>🧠 Engineering Philosophy</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6 text-center md:text-left">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              HSBS는 단순한 기능 구현 프로젝트가 아닙니다.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              저는 다음과 같은 기준으로 서비스를 설계합니다.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>기능이 아니라 구조를 먼저 설계합니다</li>
              <li>단일 기능이 아닌 확장 가능한 아키텍처를 설계합니다</li>
              <li>AI는 부가 기능이 아니라 서비스 레벨에서 통합합니다</li>
              <li>운영을 고려하지 않은 설계는 하지 않습니다</li>
              <li>권한·로그·통계는 기본 구성요소로 포함합니다</li>
            </ul>
            <p className="text-gray-800 dark:text-white font-semibold pt-4">
              저는 &quot;기능을 구현하는 개발자&quot;가 아니라
              <br />
              확장 가능한 서비스 구조를 설계하는 개발자를 지향합니다.
            </p>
          </div>
        </motion.section>

        {/* Projects - Slider Carousel */}
        <motion.section
          id="projects"
          className={`${SECTION_CLASS} bg-white dark:bg-[#121212] w-full text-center`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className={SECTION_TITLE_CLASS}>📌 Projects</h2>
          </div>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            풀스택 개발자로서 직접 설계하고 운영한 콘텐츠 통합 플랫폼입니다. 실무 경험 기반으로 콘텐츠 관리, 권한 제어, 로그 분석 기능을 포함합니다. 카드를 클릭하면 상세 내용을 볼 수 있습니다.
          </motion.p>
          <motion.div
            className="mt-14 max-w-5xl mx-auto px-4 relative"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={28}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 2, spaceBetween: 32 },
              }}
              loop
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              pagination={{
                clickable: true,
                bulletClass: 'projects-bullet',
                bulletActiveClass: 'projects-bullet-active',
              }}
              navigation={{
                prevEl: '.projects-prev',
                nextEl: '.projects-next',
              }}
              className="projects-carousel relative"
            >
              {PROJECTS.map((item) => (
                <SwiperSlide key={item.detail.id}>
                  <ProjectCard
                    icon={<item.icon size={24} />}
                    title={item.title}
                    desc={item.desc}
                    period={item.period}
                    platform={item.platform}
                    stack={item.stack}
                    coverImage={item.coverImage}
                    onClick={() => setSelectedProject(item.detail)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <button type="button" className="projects-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition -translate-x-2 md:-translate-x-4" aria-label="이전 프로젝트">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button type="button" className="projects-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition translate-x-2 md:translate-x-4" aria-label="다음 프로젝트">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <style>{`
              .projects-carousel .projects-bullet { width: 8px; height: 8px; background: rgba(0,0,0,0.2); opacity: 1; transition: all 0.2s; }
              .dark .projects-carousel .projects-bullet { background: rgba(255,255,255,0.3); }
              .projects-carousel .projects-bullet-active { background: #2563eb; width: 24px; border-radius: 4px; }
            `}</style>
          </motion.div>
        </motion.section>

        {/* Skills */}
        <motion.section
          id="skills"
          className={`${SECTION_CLASS} bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-6`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={SECTION_TITLE_CLASS}>📌 Skills</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-center md:text-left">
              <span className="text-blue-400">프론트엔드</span>부터 <span className="text-blue-400">백엔드</span>, 그리고 <span className="text-blue-400">DevOps</span>까지
              하나의 흐름으로 연결된 개발 경험을 보유하고 있습니다.
            </p>
            <div className="mt-14 space-y-10">
              <SkillGroup title="프로그래밍 언어" icon="🧠">
                <TechIcon src="/icons/javascript.svg" alt="JavaScript" />
                <TechIcon src="/icons/typescript.svg" alt="TypeScript" />
                <TechIcon src="/icons/java.svg" alt="Java" />
                <TechIcon src="/icons/php.svg" alt="PHP" />
                <TechIcon src="/icons/html5.svg" alt="HTML5" />
                <TechIcon src="/icons/css3.svg" alt="CSS3" />
              </SkillGroup>
              <SkillGroup title="프레임워크" icon="⚡">
                <TechIcon src="/icons/React.png" alt="React" />
                <TechIcon src="/icons/spring.svg" alt="Spring" />
                <TechIcon src="/icons/spring-boot.png" alt="Spring-Boot" />
                <TechIcon src="/icons/jquery.png" alt="Jquery" />
                <TechIcon src="/icons/node.jpg" alt="Node" />
              </SkillGroup>
              <SkillGroup title="데이터베이스" icon="🗄️">
                <TechIcon src="/icons/mysql.png" alt="MySQL" />
                <TechIcon src="/icons/oracle.png" alt="Oracle" />
                <TechIcon src="/icons/MariaDB.png" alt="MariaDB" />
                <TechIcon src="/icons/microsoft-sql-server.png" alt="MS-SQL" />
              </SkillGroup>
              <SkillGroup title="개발 도구" icon="🧰">
                <TechIcon src="/icons/vscode.png" alt="VSCode" />
                <TechIcon src="/icons/ij.png" alt="IntelliJ" />
                <TechIcon src="/icons/eclipse.png" alt="Eclipse" />
                <TechIcon src="/icons/dbeaver.png" alt="Dbeaver" />
                <TechIcon src="/icons/postman.png" alt="PostMan" />
              </SkillGroup>
              <SkillGroup title="협업 도구" icon="🤝">
                <TechIcon src="/icons/github.svg" alt="GitHub" />
                <TechIcon src="/icons/gitlab.png" alt="GitLab" />
                <TechIcon src="/icons/notion.png" alt="Notion" />
                <TechIcon src="/icons/teams.png" alt="Teams" />
              </SkillGroup>
            </div>
          </div>
        </motion.section>

        {/* Securities Data */}
        <motion.section
          id="securitiesData"
          className={`${SECTION_CLASS} bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className={SECTION_TITLE_CLASS}>📌 Securities Data</h2>
          </div>
          <SecuritiesDataSection />
        </motion.section>

        {/* Deploy */}
        <motion.section
          id="deploy"
          className={`${SECTION_CLASS} bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className={SECTION_TITLE_CLASS}>📌 Deploy</h2>
          </div>
          <DeploySection />
        </motion.section>

        {/* Dynamic Sections */}
        <motion.section
          id="sections"
          className="scroll-mt-24 py-12 space-y-12 bg-white dark:bg-[#121212] border-t"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className={SECTION_TITLE_CLASS}>📌 Sections</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-center">
            이 사이트는 <span className="text-blue-400">관리자 페이지에서 등록한 페이지와 섹션 데이터</span>를 기반으로,{' '}
            <span className="text-blue-400">컴포넌트 단위로 동적으로 조립</span>되어 렌더링됩니다. (※ 프로토타입 버전)
          </p>
          {sections.map((section, index) => {
            const parsedOptionJson = typeof section.optionJson === 'string' ? JSON.parse(section.optionJson) : section.optionJson;
            return (
              <div key={section.id} data-aos="fade-up" data-aos-delay={index * 100}>
                <DynamicSection layoutType={section.layoutType} optionJson={parsedOptionJson} />
              </div>
            );
          })}
        </motion.section>

        {/* Banner */}
        {bannerPopups.length > 0 && (
          <div className="my-10 max-w-3xl mx-auto px-4">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              loop
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation
            >
              {bannerPopups.map((popup) => (
                <SwiperSlide key={popup.id}>
                  <div className="relative">
                    <img src={`${FILE_BASE_URL}${popup.filePath}`} alt={popup.title} className="w-full max-h-[400px] object-contain rounded-lg shadow-md" />
                    {popup.linkUrl && (
                      <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
                        <span className="sr-only">{popup.title}</span>
                      </a>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Popup modal */}
        {isPopupOpen && popupPopups.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow relative w-[80vw] h-[80vh] max-w-5xl max-h-[90vh] flex flex-col">
              <button
                type="button"
                className="absolute top-4 right-4 w-12 h-12 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white text-3xl font-bold flex items-center justify-center z-10"
                onClick={handleClosePopup}
                aria-label="닫기"
              >
                ✕
              </button>
              <div className="flex-1 flex justify-center items-center min-h-0">
                <Swiper modules={[Navigation, Pagination]} spaceBetween={30} slidesPerView={1} navigation pagination={{ clickable: true }} className="w-full h-full">
                  {popupPopups.map((popup) => (
                    <SwiperSlide key={popup.id}>
                      <div className="relative w-full h-full flex justify-center items-center">
                        <img src={`${FILE_BASE_URL}${popup.filePath}`} alt={popup.title} className="max-w-full max-h-full object-contain rounded" />
                        {popup.linkUrl && (
                          <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] z-20">
                            <span className="sr-only">{popup.title}</span>
                          </a>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={handleClosePopupToday} className="text-xs md:text-sm px-3 py-1 border rounded-md text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  오늘 하루 보지 않기
                </button>
                <button type="button" onClick={handleClosePopup} className="text-xs md:text-sm px-3 py-1 border rounded-md text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

/** 프로젝트 캐러셀용 카드 (클릭 시 상세 모달). coverImage 있으면 상단 썸네일 표시 */
const ProjectCard = ({
  icon,
  title,
  desc,
  period,
  platform,
  stack,
  coverImage,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  period?: string;
  platform?: string;
  stack?: string[];
  coverImage?: string;
  onClick?: () => void;
}) => (
  <motion.div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
    className="h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition text-left flex flex-col cursor-pointer group"
    whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.2)' }}
    whileTap={{ scale: 0.98 }}
  >
    {coverImage ? (
      <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={coverImage}
          alt=""
          className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 right-2">
          {platform && (
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-white/90 dark:bg-gray-800/90 text-blue-700 dark:text-blue-300 shadow-sm">
              {platform}
            </span>
          )}
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-between gap-2 pt-5 px-5 pb-0">
        <div className="flex items-center gap-3 text-[#003366] dark:text-blue-300 min-w-0">
          <div className="p-2 bg-[#f0f4f8] dark:bg-gray-700 rounded-full flex-shrink-0">{icon}</div>
          <h3 className="text-lg font-semibold truncate">{title}</h3>
        </div>
        {platform && (
          <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            {platform}
          </span>
        )}
      </div>
    )}
    <div className={`flex flex-col flex-1 ${coverImage ? 'p-5' : 'px-5 pt-2 pb-5'}`}>
      {coverImage && (
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-[#f0f4f8] dark:bg-gray-700 rounded-lg flex-shrink-0 text-[#003366] dark:text-blue-300">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
        </div>
      )}
      {!coverImage && period && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{period}</p>}
      {coverImage && period && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{period}</p>}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1 line-clamp-3">{desc}</p>
      {stack && stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      {onClick && (
        <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium underline-offset-2 group-hover:underline">클릭하여 상세 보기</p>
      )}
    </div>
  </motion.div>
);

export default MainPage;

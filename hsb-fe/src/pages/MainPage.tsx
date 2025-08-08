import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Code, ServerCog, ClipboardList, BarChart4 } from 'lucide-react';
import Layout from '../components/Layout/Layout';

import AOS from "aos";
import "aos/dist/aos.css";

import SideNav from '../components/Common/SideNav';
import IntroSection from '../components/Common/IntroSection';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { PopupBannerItem } from '../types/Admin/PopupBannerItem'
import { fetchVisiblePopupBanners } from '../services/Admin/popupBannerApi';
import { FILE_BASE_URL } from '../config/config';
import { fetchPageByUrl } from '../services/Admin/pageApi';
import { fetchPageSectonList } from '../services/Admin/pageSectionApi';
import { Block, PageSectionItem } from '../types/Admin/PageSectionItem';
import DynamicSection from './Admin/Page/DynamicSection';
import { SkillGroup, TechIcon } from '../components/Common/SkillGroup';

const MainPage = () => {
  const [bannerPopups, setBannerPopups] = useState<PopupBannerItem[]>([]);
  const [popupPopups, setPopupPopups] = useState<PopupBannerItem[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const location = useLocation(); // 현재 pathname: '/', '/about' 등
  const [showSideNav, setShowSideNav] = useState(false);

  const [sections, setSections] = useState<PageSectionItem[]>([]); //  섹션 상태 추가

  //  팝업배너 로딩 함수
  const loadPopupBanners = async () => {
    try {
      const res = await fetchVisiblePopupBanners();
      const filtered = res.filter((popup) => popup.useTf === 'Y');

      setBannerPopups(filtered.filter(p => p.type === 'banner'));
      const popupList = filtered.filter(p => p.type === 'popup');

      if (popupList.length > 0) {
        setPopupPopups(popupList);
        setIsPopupOpen(true);
      }
    } catch (e) {
      console.error("팝업 로딩 실패", e);
    }
  };

  // 섹션 로딩 함수
  const loadSections = async () => {
    try {
      const url = location.pathname;
      const pageRes = await fetchPageByUrl(url); //  URL 기반 Page ID 조회
      console.log("페이지 정보:", pageRes);
      const pageId = pageRes.id;

      const res = await fetchPageSectonList(pageId, '', 0, 10, 'Y');

      console.log("페이지 섹션 목록:", res);

      const parsed = res.items.map((section: PageSectionItem) => {
        const parsedJson =
          typeof section.optionJson === "string"
            ? JSON.parse(section.optionJson)
            : section.optionJson;

        const fileMap = new Map<string, string>();
        (section.files ?? []).forEach(file => {
          fileMap.set(file.originalFileName, file.filePath);
        });

        const mapBlockSrc = (blocks: Block[] = []) => {
          return blocks.map((block) => {
            if (block.type === "IMAGE" || block.type === "VIDEO") {
              if (typeof block.src === "string" && block.src.trim() !== "") {
                return block;
              }
              const matched = fileMap.get(block.label ?? "");
              return {
                ...block,
                src: matched ? `${FILE_BASE_URL}${matched}` : undefined,
              };
            }
            return block;
          });
        };

        return {
          ...section,
          optionJson: {
            ...parsedJson,
            left: mapBlockSrc(parsedJson.left),
            right: mapBlockSrc(parsedJson.right),
          },
          files: section.files ?? [],
        };
      });

      setSections(parsed);
    } catch (error) {
      console.error("페이지 섹션 조회 실패", error);
      alert("페이지 섹션 조회에 실패하였습니다. 관리자에게 문의해주세요.");
    }
  };

  // SideNav 표시 여부 결정
  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById("about");

      if (aboutSection) {
        const sectionTop = aboutSection.offsetTop;
        const scrollY = window.scrollY || window.pageYOffset;

        if (scrollY + window.innerHeight / 2 >= sectionTop) {
          setShowSideNav(true); // 스크롤이 About에 도달하면 보이기
        } else {
          setShowSideNav(false); // 아닐 경우 숨기기
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadPopupBanners();
    loadSections();
  }, [location.pathname]); // pathname 변경되면 재호출

    
  useEffect(() => {
    AOS.init();
  },[])
  
  return (
    <Layout>
      <IntroSection /> 

      {showSideNav && <SideNav />}

      {/* About Me Section */}
      <section
        id="about"
        className="min-h-screen bg-white text-gray-800 dark:bg-[#1a1a1a] dark:text-white py-20 px-4 md:px-8 border-b"
        data-aos="fade-up"
      >
        {/* 상단 섹션 제목 */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white inline-block border-b-4 border-blue-600 pb-2">
            📌 ABOUT
          </h2>
        </div>

        {/* 본문 내용 */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12">
          <img
            src="/image/seo.jpg"
            alt="서현석 프로필"
            className="w-40 h-52 rounded-md object-cover border shadow-md"
            data-aos="zoom-in"
            data-aos-delay="100"
          />

          <div data-aos="fade-left" data-aos-delay="300" className="max-w-xl">
            <h2 className="text-2xl font-bold mb-3 text-center md:text-left">
              안녕하세요!{' '}
              <span className="text-blue-600 dark:text-blue-400">풀스택 개발자 서현석</span>
              입니다
            </h2>

            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4 text-center md:text-left">
              <li>🎂 1994.10.13</li>
              <li>📞 010-5038-4722</li>
              <li>📧 aodhzld45@gmail.com</li>
            </ul>

            <div className="space-y-4">
              <div
                className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-4 shadow-sm"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <p className="font-semibold mb-1">끈기 있는 개발자</p>
                <p className="text-sm leading-relaxed">
                  다양한 프로젝트에서 문제 해결 중심으로 접근하며, 실무에서의 안정성과
                  효율성을 항상 고민합니다.
                </p>
              </div>

              <div
                className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-4 shadow-sm"
                data-aos="fade-up"
                data-aos-delay="700"
              >
                <p className="font-semibold mb-1">꾸준히 성장하는 개발자</p>
                <p className="text-sm leading-relaxed">
                  새로운 기술에 대한 흥미와 함께, 직접 구축하고 운영하는 과정을 통해
                  기술을 체득하고 성장합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 프로젝트 카드 섹션 */}
      <div id="projects" className="bg-white dark:bg-[#121212] w-full text-center py-16 px-4 md:px-8" data-aos="fade-up">
        <div
          className="bg-white dark:bg-[#121212] w-full text-center py-16 px-4 md:px-8"
          data-aos="fade-up"
        >

        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white inline-block border-b-4 border-blue-600 pb-2">
            📌 Projects
          </h2>
        </div>

          <p
            className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            풀스택 개발자로서 직접 설계하고 운영한 콘텐츠 통합 플랫폼입니다.
            실무 경험 기반으로 콘텐츠 관리, 권한 제어, 로그 분석 기능을 포함합니다.
          </p>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 max-w-5xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <Card
              icon={<ClipboardList size={24} />}
              title="원주미래산업진흥원 구축"
              desc="PHP 기반 CMS 구축 및 회원/예약/팝업 관리 기능 개발 (2024.11~01)"
            />
            <Card
              icon={<ClipboardList size={24} />}
              title="SKT OUR365 CONNECT+ 운영 및 유지보수"
              desc="SKT 사내방송 플랫폼(GBS) 운영 요건 개발 및 로그 관련 개발 (2024.08~ 2025.03)"
            />
            <Card
              icon={<Code size={24} />}
              title="천조 키오스크 및 API 유지보수"
              desc="스타필드/센텀시티 키오스크 및 엘리베이터 디스플레이 개선 (2024.05~07)"
            />
            <Card
              icon={<ServerCog size={24} />}
              title="스마일게이트 교육플랫폼 고도화 및 유지보수"
              desc="Chart.js를 활용한 통계화면 개발, 시험/설문 기능 유지보수 (2024.01~03, 06~12)"
            />
            <Card
              icon={<BarChart4 size={24} />}
              title="한양대학교 입학처 리뉴얼"
              desc="수시, 정시, 재외국민, 편입학 페이지 개발 및 유지보수 (2022.03~05)"
            />
            <Card
              icon={<ServerCog size={24} />}
              title="대통령경호처 인재채용사이트"
              desc="[인턴십] CentOS 기반 인재채용 시스템의 서버 관리 및 유지보수 (2020.11~2021.01)"
            />
          </div>
        </div>
      </div>

      <div
        id="skills"
        className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white py-20 px-6 transition-colors duration-300"
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <div className="max-w-5xl mx-auto">

          {/* 섹션 제목 */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white inline-block border-b-4 border-blue-600 pb-2">
              📌 Skills
            </h2>
          </div>

          {/* 소개 문구 */}
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            <span className="text-blue-400">프론트엔드</span>부터 <span className="text-blue-400">백엔드</span>, 그리고 <span className="text-blue-400">DevOps</span>까지
            하나의 흐름으로 연결된 개발 경험을 보유하고 있습니다. 다양한 실무 프로젝트를 통해 기술을 단순히 '사용'하는 것이 아닌,
            문제를 해결하고 서비스를 완성하는 데 집중해왔습니다.
          </p>

          {/* 스킬 그룹들 */}
          <div className="mt-14 space-y-10">

            {/* 프로그래밍 언어 */}
            <SkillGroup title="프로그래밍 언어" icon="🧠">
              <TechIcon src="/icons/javascript.svg" alt="JavaScript" />
              <TechIcon src="/icons/typescript.svg" alt="TypeScript" />
              <TechIcon src="/icons/java.svg" alt="Java" />
              <TechIcon src="/icons/php.svg" alt="PHP" />
              <TechIcon src="/icons/html5.svg" alt="HTML5" />
              <TechIcon src="/icons/css3.svg" alt="CSS3" />
            </SkillGroup>

            {/* 프레임워크 */}
            <SkillGroup title="프레임워크" icon="⚡">
              <TechIcon src="/icons/React.png" alt="React" />
              <TechIcon src="/icons/spring.svg" alt="Spring" />
              <TechIcon src="/icons/spring-boot.png" alt="Spring-Boot" />
              <TechIcon src="/icons/jquery.png" alt="Jquery" />
              <TechIcon src="/icons/node.jpg" alt="Node" />
            </SkillGroup>

            {/* 데이터베이스 */}
            <SkillGroup title="데이터베이스" icon="🗄️">
              <TechIcon src="/icons/mysql.png" alt="MySQL" />
              <TechIcon src="/icons/oracle.png" alt="Oracle" />
              <TechIcon src="/icons/MariaDB.png" alt="MariaDB" />
              <TechIcon src="/icons/microsoft-sql-server.png" alt="MS-SQL" />
            </SkillGroup>

            {/* 개발 도구 */}
            <SkillGroup title="개발 도구" icon="🧰">
              <TechIcon src="/icons/vscode.png" alt="VSCode" />
              <TechIcon src="/icons/ij.png" alt="IntelliJ" />
              <TechIcon src="/icons/eclipse.png" alt="Eclipse" />
              <TechIcon src="/icons/dbeaver.png" alt="Dbeaver" />
              <TechIcon src="/icons/postman.png" alt="PostMan" />
            </SkillGroup>

            {/* 협업 도구 */}
            <SkillGroup title="협업 도구" icon="🤝">
              <TechIcon src="/icons/github.svg" alt="GitHub" />
              <TechIcon src="/icons/gitlab.png" alt="GitLab" />
              <TechIcon src="/icons/notion.png" alt="Notion" />
              <TechIcon src="/icons/teams.png" alt="Teams" />
            </SkillGroup>

          </div>
        </div>
      </div>


      {/* 등록된 페이지 섹션 동적 렌더링 */}
      <div className="py-12 space-y-12 bg-white dark:bg-[#121212]">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white inline-block border-b-4 border-blue-600 pb-2">
            📌 Sections
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-center">
          이 사이트는 <span className="text-blue-400">관리자 페이지에서 등록한 페이지와 섹션 데이터</span>를 기반으로,<br />
          <span className="text-blue-400">컴포넌트 단위로 동적으로 조립</span>되어 렌더링됩니다.<br />
          정해진 틀이 아닌 <span className="text-blue-400">콘텐츠 중심의 유연한 레이아웃</span>을 지원하며,<br />
          다양한 실무 콘텐츠와 구성 요소를 효율적으로 관리하고 보여줄 수 있습니다.<br />
          <span className="text-sm text-gray-400">(※ 현재는 프로토타입 버전입니다)</span>
        </p>

        {sections.map((section, index) => {
          const parsedOptionJson =
            typeof section.optionJson === "string"
              ? JSON.parse(section.optionJson)
              : section.optionJson;

          return (
            <div
              key={section.id}
              id='sections'
              data-aos="fade-up"
              data-aos-delay={index * 100} // 각 섹션마다 약간의 딜레이를 주어 자연스럽게
            >
              <DynamicSection
                layoutType={section.layoutType}
                optionJson={parsedOptionJson}
              />
            </div>
          );
        })}
      </div>

      {/* 메인 배너 부분 */}
      {bannerPopups.length > 0 && (
        <div className="my-10 max-w-3xl mx-auto">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation={true}
          >
            {bannerPopups.map((popup) => (
              <SwiperSlide key={popup.id}>
                <div className="relative">
                  <img
                    src={`${FILE_BASE_URL}${popup.filePath}`}
                    alt={popup.title}
                    className="w-full max-h-[400px] object-contain rounded-lg shadow-md"
                  />
                  {popup.linkUrl && (
                    <a
                      href={popup.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0"
                    >
                      <span className="sr-only">{popup.title}</span>
                    </a>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* 메인 팝업 부분 */}
      {isPopupOpen && popupPopups.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div
            className="
              bg-white dark:bg-gray-800
              p-6 rounded-lg shadow relative
              w-[80vw] h-[80vh]
              max-w-5xl max-h-[90vh]
              flex justify-center items-center
            "
          >
            <button
              className="
                absolute top-4 right-4
                w-12 h-12
                text-gray-500 hover:text-gray-800
                dark:text-gray-300 dark:hover:text-white
                text-3xl font-bold flex items-center justify-center
                z-10
              "
              onClick={() => setIsPopupOpen(false)}
            >
              ✕
            </button>

            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-full"
            >
              {popupPopups.map((popup) => (
                <SwiperSlide key={popup.id}>
                  <div className="relative w-full h-full flex justify-center items-center">
                    <img
                      src={`${FILE_BASE_URL}${popup.filePath}`}
                      alt={popup.title}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                    {popup.linkUrl && (
                      <a
                        href={popup.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          absolute
                          top-1/2 left-1/2
                          -translate-x-1/2 -translate-y-1/2
                          w-[80%] h-[80%]
                          z-20
                        "
                      >
                        <span className="sr-only">{popup.title}</span>
                      </a>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

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

export default MainPage;

import { Github, ChevronDown } from 'lucide-react';

const IntroSection = () => {
  return (
    <section
      id="intro"
      className="h-screen bg-white dark:bg-[#2e2e2e] text-gray-900 dark:text-white flex flex-col justify-center items-center px-4 relative transition-colors duration-300"
    >
      {/* 좌상단 GitHub 및 날짜 */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-6 text-gray-700 dark:text-white text-lg opacity-80">
        <a
          href="https://github.com/aodhzld45"
          target="_blank"
          rel="noreferrer"
          className="hover:text-blue-500 transition"
        >
          <Github size={24} />
        </a>
        <span className="text-xl">|</span>
        <span className="text-lg">{new Date().toISOString().split('T')[0]}</span>
      </div>

      {/* 인트로 중앙 콘텐츠 */}
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-800 dark:text-gray-300">
          ONE DEVELOPER<br />
          FULLSTACK FLOW
        </h1>

        <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          풀스택 개발자 <span className="text-blue-500">서현석</span>
        </p>

        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          과거의 한정된 시야에서 벗어나,<br className="hidden md:block" />
          <span className="text-black dark:text-white font-semibold">끊임없는 성장과 도전</span>을 추구하는 개발자입니다.<br />
          졸업작품부터 기업 프로젝트까지의 실전 경험을 통해,<br className="hidden md:block" />
          <span className="text-black dark:text-white font-semibold">새로운 기술과 문제 해결</span>에 즐겁게 몰입합니다.
        </p>
      </div>

      {/* 아래로 이동 아이콘 */}
      <div className="absolute bottom-8 animate-bounce">
        <a href="#about">
          <ChevronDown size={32} className="text-gray-700 dark:text-white opacity-60 hover:opacity-100 transition" />
        </a>
      </div>
    </section>
  );
};

export default IntroSection;

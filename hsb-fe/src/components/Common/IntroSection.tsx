import { motion } from 'framer-motion';
import { Github, ChevronDown } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const IntroSection = () => {
  return (
    <motion.section
      id="intro"
      className="min-h-[100dvh] overflow-hidden bg-white dark:bg-[#2e2e2e] text-gray-900 dark:text-white flex flex-col justify-center items-center px-4 relative transition-colors duration-300 py-20"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.div
        variants={item}
        className="absolute top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-6 text-gray-700 dark:text-white text-lg opacity-80"
      >
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
      </motion.div>

      <div className="text-center space-y-6 max-w-3xl">
        <motion.h1
          variants={item}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-800 dark:text-gray-300"
        >
          ONE DEVELOPER<br />
          FULLSTACK FLOW
        </motion.h1>

        <motion.p
          variants={item}
          className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white"
        >
          풀스택 개발자 <span className="text-blue-500">서현석</span>
        </motion.p>

        <motion.p
          variants={item}
          className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-4 leading-relaxed"
        >
          과거의 한정된 시야에서 벗어나,<br className="hidden md:block" />
          <span className="text-black dark:text-white font-semibold">끊임없는 성장과 도전</span>을 추구하는 개발자입니다.<br />
          졸업작품부터 기업 프로젝트까지의 실전 경험을 통해,<br className="hidden md:block" />
          <span className="text-black dark:text-white font-semibold">새로운 기술과 문제 해결</span>에 즐겁게 몰입합니다.
        </motion.p>
      </div>

      <motion.div
        variants={item}
        className="absolute bottom-8"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <a href="#about">
          <ChevronDown size={32} className="text-gray-700 dark:text-white opacity-60 hover:opacity-100 transition" />
        </a>
      </motion.div>
    </motion.section>
  );
};

export default IntroSection;

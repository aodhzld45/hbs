import type { ReactNode } from 'react';
import { Brain, FileSearch, GitBranch, Gauge, MessageSquareText, ShieldCheck, Timer, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

const Pill = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span className={`inline-block text-xs md:text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border ${className}`}>
    {children}
  </span>
);

const SummaryBlock = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-xl border bg-white dark:bg-[#141414] dark:border-gray-800 p-4 md:p-6">
    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
      {icon}
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </div>
  </div>
);

const Step = ({
  no,
  title,
  children,
}: {
  no: number;
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-xl border bg-white dark:bg-[#141414] dark:border-gray-800 p-4 md:p-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
        {no}
      </div>
      <h4 className="text-base md:text-lg font-semibold">{title}</h4>
    </div>
    <div className="text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </div>
  </div>
);

const TECH_STACK = [
  'React 19',
  'TypeScript',
  'TailwindCSS',
  'FastAPI',
  'SQLAlchemy',
  'PostgreSQL',
  'pgvector',
  'LangGraph',
  'OpenAI API',
  'LangSmith',
  'BGE-M3',
  'BM25',
  'BGE-reranker',
  'PyMuPDF',
  'RapidOCR',
];

const WORKFLOW_NODES = [
  'build_state',
  'analyzer',
  'questioner',
  'selector_lite',
  'predictor',
  'driller',
  'reviewer',
  'scorer',
  'selector',
];

export default function HrCopilotSection() {
  return (
    <motion.section
      id="hr-copilot"
      className="scroll-mt-24 py-20 px-4 md:px-8 border-t bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white inline-block border-b-4 border-blue-600 pb-2">
          HR COPILOT
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm md:text-base">
          지원자 문서와 채용공고 데이터를 기반으로 <b>면접 질문 생성</b>과 <b>채용공고 분석</b>을 지원하는 LLM 기반 HR 업무 지원 서비스입니다.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border bg-white dark:bg-[#121212] dark:border-gray-800 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
                <Brain size={18} />
                <h3 className="font-semibold">AI / Agent</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.slice(7, 13).map((item) => (
                  <Pill key={item}>{item}</Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
                <Workflow size={18} />
                <h3 className="font-semibold">Product Stack</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.slice(0, 7).map((item) => (
                  <Pill key={item}>{item}</Pill>
                ))}
                <Pill>FastAPI BackgroundTasks</Pill>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-10">
          <SummaryBlock icon={<MessageSquareText size={18} />} title="면접 질문 생성">
            <ul className="list-disc ml-5 space-y-1">
              <li>지원자 이력서와 직무 정보를 바탕으로 면접 질문, 예상 답변, 평가 가이드를 생성</li>
              <li>questioner, predictor, driller, reviewer, scorer 흐름으로 질문 품질을 점검</li>
              <li>100점 루브릭 기반 Judge Agent를 통해 질문의 실무 적합도를 평가</li>
            </ul>
          </SummaryBlock>

          <SummaryBlock icon={<FileSearch size={18} />} title="채용공고 분석">
            <ul className="list-disc ml-5 space-y-1">
              <li>채용공고 문구에서 채용절차법 위반 가능성이 있는 위험 패턴을 탐지</li>
              <li>Rule 탐지와 Hybrid RAG(BGE-M3, BM25, reranker)를 결합해 법령 근거를 검색</li>
              <li>위반 항목, 근거 조항, 수정 권고를 포함한 컴플라이언스 리포트 제공</li>
            </ul>
          </SummaryBlock>
        </div>

        <div className="grid gap-6 md:gap-8 mt-10">
          <Step no={1} title="문서 처리와 데이터 정리">
            <ul className="list-disc ml-5 space-y-1">
              <li>PyMuPDF와 RapidOCR로 이력서·지원자 문서의 텍스트를 추출</li>
              <li>지원자, 문서, 면접 세션, 면접 질문, 채용공고, LLM 로그 데이터를 분리 관리</li>
              <li>PostgreSQL + pgvector에 검색 가능한 문서·법령 근거 데이터를 저장</li>
            </ul>
          </Step>

          <Step no={2} title="LangGraph 멀티에이전트 워크플로우">
            <div className="flex flex-wrap gap-2 mb-3">
              {WORKFLOW_NODES.map((node) => (
                <Pill key={node} className="font-mono">
                  {node}
                </Pill>
              ))}
            </div>
            <p>
              초기 상태 구성부터 분석, 질문 생성, 답변 예측, 꼬리 질문, 검증, 점수화, 최종 선택까지 노드 단위로 분리해 추론 흐름을 추적할 수 있게 구성했습니다.
            </p>
          </Step>

          <Step no={3} title="평가와 리스크 검증">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 text-sm font-semibold mb-1">
                  <Gauge size={16} />
                  질문 평가
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">62개 이력서와 9가지 지원자 유형으로 품질 평가</p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-300 text-sm font-semibold mb-1">
                  <ShieldCheck size={16} />
                  공고 평가
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">50건의 채용공고로 위험 패턴 탐지 성능 검증</p>
              </div>
              <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 text-sm font-semibold mb-1">
                  <Timer size={16} />
                  처리 시간
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">FastAPI 비동기 작업과 AiJob polling으로 생성 상태 제공</p>
              </div>
            </div>
          </Step>

          <Step no={4} title="추론 추적과 운영 대시보드">
            <ul className="list-disc ml-5 space-y-1">
              <li>LangSmith API 연동으로 노드별 토큰 사용량, 비용, 레이턴시를 조회</li>
              <li>면접 세션과 채용공고 분석 작업의 진행 상태를 대시보드에서 확인</li>
              <li>프론트엔드 Vercel, 백엔드 팀 서버 배포 구조를 기준으로 팀 프로젝트 운영</li>
            </ul>
          </Step>

          <div className="rounded-xl border bg-white dark:bg-[#141414] dark:border-gray-800 p-4 md:p-6">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
              <GitBranch size={18} />
              <h3 className="font-semibold">Repository</h3>
            </div>
            <a
              href="https://github.com/bamti95/hr-copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm md:text-[15px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              github.com/bamti95/hr-copilot
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

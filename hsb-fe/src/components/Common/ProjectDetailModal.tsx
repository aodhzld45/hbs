import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/** React 18+ JSX 호환: framer-motion AnimatePresence 반환 타입 보정 */
const AnimatePresence = FramerAnimatePresence as React.FC<{ children?: React.ReactNode }>;

export interface ProjectDetail {
  id: string;
  title: string;
  period: string;
  platform: string;
  role?: string;
  summary: string;
  bullets: string[];
  stack: string[];
  link?: { label: string; url: string };
  /** 상세 모달에서 보여줄 이미지 경로 목록 (public 기준, 예: /image/main/wonju01.png) */
  images?: string[];
}

interface ProjectDetailModalProps {
  project: ProjectDetail | null;
  onClose: () => void;
}

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panel = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const images = project?.images ?? [];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!project) return;
    setImageIndex(0);
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* 헤더: 제목 + 닫기 */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 id="project-detail-title" className="text-xl font-bold text-gray-900 dark:text-white pr-4 truncate">
                {project.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
                aria-label="닫기"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {/* 이미지 갤러리 (main 폴더 이미지) */}
              {images.length > 0 && (
                <div className="relative w-full bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                  <div className="aspect-video w-full overflow-hidden rounded-t-none">
                    <img
                      src={images[imageIndex]}
                      alt={`${project.title} ${imageIndex + 1}`}
                      className="w-full h-full object-contain object-center"
                    />
                  </div>
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageIndex((i) => (i - 1 + images.length) % images.length);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                        aria-label="이전 이미지"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageIndex((i) => (i + 1) % images.length);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                        aria-label="다음 이미지"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageIndex(i);
                            }}
                            className={`w-2 h-2 rounded-full transition ${
                              i === imageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`이미지 ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2 text-sm items-center">
                  <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                    {project.platform}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{project.period}</span>
                  {project.role && (
                    <span className="text-gray-600 dark:text-gray-300">{project.role}</span>
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.summary}</p>

                {project.bullets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">담당 업무</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {project.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {project.link && (
                  <a
                    href={project.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    {project.link.label} →
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailModal;

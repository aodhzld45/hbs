import {
  Building2,
  CheckCircle2,
  FileUp,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
} from 'lucide-react';
import Layout from '../../../components/Layout/Layout';
import PrivacyPolicyModal from '../../../components/Common/PrivacyPolicyModal';
import { useContactForm } from './hooks/useContactForm';

const fieldBaseClass =
  'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-950/60';

const labelClass = 'mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200';

const inputWrapClass = 'relative';

const iconClass = 'pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500';

const inputWithIconClass = `${fieldBaseClass} pl-11`;

const ContactForm = () => {
  const {
    form,
    showModal,
    setShowModal,
    handleChange,
    handleSubmit,
    loading,
    fileRef,
  } = useContactForm();

  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl py-8 sm:py-12">
        <div className="mb-8 border-b border-gray-200 pb-6 dark:border-zinc-800">
          <p className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">CONTACT</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            문의하기
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
            프로젝트 내용과 연락처를 남겨주시면 담당자가 확인 후 빠르게 답변드리겠습니다.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="companyName" className={labelClass}>
                  회사명
                </label>
                <div className={inputWrapClass}>
                  <Building2 className={iconClass} />
                  <input
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="회사명을 입력해주세요"
                    className={inputWithIconClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactName" className={labelClass}>
                  담당자명
                </label>
                <div className={inputWrapClass}>
                  <UserRound className={iconClass} />
                  <input
                    id="contactName"
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="담당자명을 입력해주세요"
                    className={inputWithIconClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  이메일
                </label>
                <div className={inputWrapClass}>
                  <Mail className={iconClass} />
                  <input
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    type="email"
                    className={inputWithIconClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  연락처
                </label>
                <div className={inputWrapClass}>
                  <Phone className={iconClass} />
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                    className={inputWithIconClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="title" className={labelClass}>
                문의 제목
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="문의 제목을 입력해주세요"
                className={fieldBaseClass}
                required
              />
            </div>

            <div className="mt-5">
              <label htmlFor="message" className={labelClass}>
                문의 내용
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="문의하실 내용을 입력해주세요"
                className={`${fieldBaseClass} min-h-44 resize-y leading-6`}
                required
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="projectType" className={labelClass}>
                  프로젝트 유형
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={form.projectType}
                  onChange={handleChange}
                  className={fieldBaseClass}
                >
                  <option value="">선택 안 함</option>
                  <option value="협업">협업</option>
                  <option value="의뢰">의뢰</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label htmlFor="replyMethod" className={labelClass}>
                  답변 방식
                </label>
                <select
                  id="replyMethod"
                  name="replyMethod"
                  value={form.replyMethod}
                  onChange={handleChange}
                  className={fieldBaseClass}
                >
                  <option value="">선택 안 함</option>
                  <option value="EMAIL">이메일</option>
                  <option value="SMS">문자</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="file" className={labelClass}>
                첨부파일
              </label>
              <label
                htmlFor="file"
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FileUp className="h-5 w-5 flex-none text-blue-500" />
                  <span className="truncate">
                    {form.file ? form.file.name : '파일을 선택해주세요'}
                  </span>
                </span>
                <span className="flex-none rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:bg-zinc-800 dark:text-gray-200">
                  찾아보기
                </span>
              </label>
              <input
                id="file"
                ref={fileRef}
                type="file"
                name="file"
                onChange={handleChange}
                className="sr-only"
              />
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
              <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="agreeTf"
                  checked={form.agreeTf}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900"
                />
                <span>
                  개인정보 수집 및 이용에 동의합니다.{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowModal(true);
                    }}
                    className="font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                  >
                    내용 보기
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-950 dark:disabled:bg-zinc-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  등록 중입니다
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  문의 등록
                </>
              )}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-gray-950 dark:text-white">접수 안내</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                문의 등록 후 관리자에게 알림 메일이 발송되며, 입력하신 답변 방식에 따라 회신이 진행됩니다.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-gray-950 dark:text-white">필수 확인</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                이메일과 연락처가 정확해야 담당자가 문의 내용을 확인한 뒤 답변드릴 수 있습니다.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <PrivacyPolicyModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </Layout>
  );
};

export default ContactForm;

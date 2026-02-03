import Layout from '../../../components/Layout/Layout';
import PrivacyPolicyModal from '../../../components/Common/PrivacyPolicyModal';
import { useContactForm } from './hooks/useContactForm';

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
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 p-6 border rounded-md shadow">
        <h2 className="text-2xl font-bold dark:text-gray-400">문의하기</h2>

        <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="회사명" className="w-full border p-2" required />
        <input name="contactName" value={form.contactName} onChange={handleChange} placeholder="담당자명" className="w-full border p-2" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="이메일" type="email" className="w-full border p-2" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="연락처" className="w-full border p-2" required />
        <input name="title" value={form.title} onChange={handleChange} placeholder="문의 제목" className="w-full border p-2" required />
        <textarea name="message" value={form.message} onChange={handleChange} placeholder="문의 내용" className="w-full border p-2 h-32" required />

        <select name="projectType" value={form.projectType} onChange={handleChange} className="w-full border p-2">
          <option value="">-- 프로젝트 유형 선택 --</option>
          <option value="협업">협업</option>
          <option value="의뢰">의뢰</option>
          <option value="기타">기타</option>
        </select>

        <select name="replyMethod" value={form.replyMethod} onChange={handleChange} className="w-full border p-2">
          <option value="">-- 답변 방법 선택 --</option>
          <option value="EMAIL">이메일</option>
          <option value="SMS">문자</option>
        </select>

        <input
          ref={fileRef}
          type="file"
          name="file"
          onChange={handleChange}
          className="w-full border p-2 dark:text-gray-400"
        />

        <label className="flex items-center gap-2 text-sm dark:text-gray-400">
          <input type="checkbox" name="agreeTf" checked={form.agreeTf} onChange={handleChange} />
          <span>
            개인정보 수집 및 이용에 동의합니다.{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(true);
              }}
              className="underline text-blue-600 hover:text-blue-800"
            >
              [내용 보기]
            </button>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? '등록중입니다...' : '문의 등록'}
        </button>
        
      </form>

      <PrivacyPolicyModal isOpen={showModal} onClose={() => setShowModal(false)} />

    </Layout>
  );
};

export default ContactForm;

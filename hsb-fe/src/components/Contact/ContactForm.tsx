import Layout from '../Layout/Layout';
import React, { useState, useEffect } from 'react';
import { ContactItem } from '../../types/Common/ContactItem';
import { fetchContactCreate } from '../../services/Common/ContactApi';
import PrivacyPolicyModal from '../Common/PrivacyPolicyModal';

const ContactForm = () => {
  const [form, setForm] = useState<ContactItem>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    title: '',
    message: '',
    projectType: '',
    replyMethod: '',
    file: null,
    agreeTf: false,
  });

  const [showModal, setShowModal] = useState(false);

  // 이메일 정규식 유효성 검사
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 전화번호 정규식 유효성 검사 (010-0000-0000 형태 허용)
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
    return phoneRegex.test(phone);
  };

  // 전화번호 입력 포맷 함수 (자동 하이픈 추가)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;

    if (type === 'file') {
      setForm(prev => ({ ...prev, file: files?.[0] ?? null }));
    } else {
      let inputValue = value;
      if (name === 'phone') {
        inputValue = formatPhone(value);
      }

      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : inputValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.agreeTf) {
      alert('개인정보 수집 동의가 필요합니다.');
      return;
    }

    if (!isValidEmail(form.email)) {
      alert('유효한 이메일 형식이 아닙니다.');
      return;
    }

    if (!isValidPhone(form.phone)) {
      alert('유효한 전화번호 형식이 아닙니다. 예: 010-1234-5678');
      return;
    }

    try {
      const res = await fetchContactCreate(form);
      alert(res.message || '문의가 등록되었습니다.');

      // 폼 초기화
      setForm({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        title: '',
        message: '',
        projectType: '',
        replyMethod: '',
        file: null,
        agreeTf: false,
      });
    } catch (err) {
      console.error(err);
      alert('문의 등록에 실패했습니다.');
    }
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 p-6 border rounded-md shadow">
        <h2 className="text-2xl font-bold">문의하기</h2>

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
          <option value="BOTH">둘 다</option>
        </select>

        <input type="file" name="file" onChange={handleChange} className="w-full border p-2" />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="agreeTf" checked={form.agreeTf} onChange={handleChange} />
          <span>
            개인정보 수집 및 이용에 동의합니다.{' '}
            <button type="button" onClick={() => setShowModal(true)} className="underline text-blue-600 hover:text-blue-800">
              [내용 보기]
            </button>
          </span>
        </label>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          문의 등록
        </button>
      </form>

      <PrivacyPolicyModal isOpen={showModal} onClose={() => setShowModal(false)} />

    </Layout>
  );
};

export default ContactForm;

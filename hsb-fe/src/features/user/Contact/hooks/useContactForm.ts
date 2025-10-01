// src/features/contact/hooks/useContactForm.ts
import { useState, useRef } from 'react';
import { ContactUserItem } from '../types/ContactUserItem';
import { fetchContactCreate } from '../services/ContactApi';

export function useContactForm() {
  const [form, setForm] = useState<ContactUserItem>({
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

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // 이메일 정규식 유효성 검사
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // 전화번호 정규식 유효성 검사 (010-0000-0000 형태 허용)
  const isValidPhone = (phone: string) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone);
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
      setForm((prev) => ({ ...prev, file: files?.[0] ?? null }));
    } else {
      let inputValue = value;
      if (name === 'phone') {
        inputValue = formatPhone(value);
      }

      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : inputValue,
      }));
    }
  };

  const resetForm = () => {
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
    if (fileRef.current) fileRef.current.value = ''; // 파일 초기화

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);   //  전송 시작

    if (!form.agreeTf) return alert('개인정보 수집 동의가 필요합니다.');
    if (!isValidEmail(form.email)) return alert('유효한 이메일 형식이 아닙니다.');
    if (!isValidPhone(form.phone)) return alert('유효한 전화번호 형식이 아닙니다. 예: 010-1234-5678');

    try {
      const res = await fetchContactCreate(form);
      alert(res.message || '문의가 등록되었습니다.');
      resetForm();
    } catch (err) {
      console.error(err);
      alert('문의 등록에 실패했습니다.');
    } finally { 
      setLoading(false);   // 전송 완료
    }
  };

  return {
    form,
    showModal,
    setShowModal,
    handleChange,
    handleSubmit,
    loading,
    fileRef, 
  };
}

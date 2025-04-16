// src/pages/Admin/AdminRegister.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import { registerAdmin } from '../../services/Admin/adminApi';
import { Admin } from '../../types/Admin/Admin';

interface RegisterForm {
  id: string;
  name: string;
  email: string;
  password: string;
  tel?: string;
  memo?: string;
}

const AdminRegister: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    id: '',
    name: '',
    email: '',
    password: '',
    tel: '',
    memo: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('관리자 등록 시도:', formData);
      // 관리자 등록 API 호출
      const newAdmin: Admin = await registerAdmin(formData as Admin);
      console.log('등록 성공:', newAdmin);
      setSuccess('관리자 등록에 성공했습니다.');
      // 등록 후 대시보드 또는 로그인 페이지로 이동 가능
      // 예: navigate('/admin/login');
    } catch (err) {
      console.error(err);
      setError('관리자 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              관리자 등록
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              {/* 아이디 */}
              <div>
                <label htmlFor="id" className="sr-only">
                  아이디
                </label>
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  placeholder="아이디"
                  value={formData.id}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {/* 이름 */}
              <div>
                <label htmlFor="name" className="sr-only">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="이름"
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="sr-only">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="이메일"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {/* 전화번호 (옵션) */}
              <div>
                <label htmlFor="tel" className="sr-only">
                  전화번호
                </label>
                <input
                  id="tel"
                  name="tel"
                  type="text"
                  placeholder="전화번호 (옵션)"
                  value={formData.tel}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {/* 메모 (옵션) */}
              <div>
                <label htmlFor="memo" className="sr-only">
                  메모
                </label>
                <textarea
                  id="memo"
                  name="memo"
                  placeholder="메모 (옵션)"
                  value={formData.memo}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-500 text-sm text-center">{success}</div>}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                등록하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRegister;

import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminLogin } from '../../services/Admin/adminApi';
import { Admin } from '../../types/Admin/Admin';

interface LoginForm {
  id: string;
  password: string;
}

const AdminLogin = () => {
  const [formData, setFormData] = useState<LoginForm>({
    id: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  // 이미 로그인된 상태이면 /admin/index로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/index');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('로그인 시도:', formData);
    try {
      const admin: Admin = await fetchAdminLogin(formData.id, formData.password);
      console.log('로그인 성공:', admin);
      login(admin); // 전역 인증 상태를 업데이트
      navigate('/admin/index'); // 로그인 성공 후 원하는 관리자 페이지로 이동
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              관리자 로그인
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="id" className="sr-only">
                  아이디
                </label>
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="아이디"
                  value={formData.id}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그인
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AdminLogin;

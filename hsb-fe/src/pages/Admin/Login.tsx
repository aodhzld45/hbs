import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminLogin, fetchGetIp } from '../../services/Admin/adminApi';
import axios from 'axios';

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
  const [ip, setIp] = useState<string>('');
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/index');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // 내부망 또는 사내망: Spring 서버에서 IP 반환
    fetchGetIp().then(ip => {
      try {
        setIp(ip);
      } catch (err) {
        console.error('내부망 IP 가져오기 실패', err);
      }
    });
  
    // 외부망: 클라이언트의 공인 IP가 필요한 경우 아래 주석을 해제하세염...
    /*
    const fetchExternalIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setIp(data.ip);
      } catch (err) {
        console.error('공인 IP 가져오기 실패', err);
      }
    };
  
    fetchExternalIp();
    */
  }, []);

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

    try {
      const loginResponse: any = await fetchAdminLogin(formData.id, formData.password);
      const token = loginResponse.token;
      const adminInfo = loginResponse;

      // AuthContext에 token과 admin 함께 전달
      login(
        {
          id: adminInfo.adminId,
          name: adminInfo.name,
          email: adminInfo.email,
          groupId: adminInfo.groupId,
          isDeleted: false,
        }, 
        token
      );

      // 로그인 성공 후 이동
      navigate('/admin/index');
    } catch (err: any) {
      setError(err?.message ?? '로그인에 실패했습니다.');
    }

  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 배경 영상 */}
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/mp4/video-about-hyosung-index.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
  
      {/* 로그인 박스 */}
      <div className="relative z-10 flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <div className="max-w-md w-full space-y-8 bg-white bg-opacity-90 p-8 rounded-xl shadow-xl">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              관리자 로그인
            </h2>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 아이디 + 비밀번호 입력 */}
            <div className="space-y-4">
              {/*  아이디 */}
              <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-2">
                <img src="/image/bg_id.gif" alt="아이디" className="w-3 h-3 mr-3" />
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  className="w-full border-none focus:outline-none text-sm text-gray-900 placeholder-gray-500"
                  placeholder="아이디"
                  value={formData.id}
                  onChange={handleChange}
                />
              </div>
  
              {/*  비밀번호 */}
              <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-2">
                <img src="/image/bg_pw.gif" alt="비밀번호" className="w-3 h-3 mr-3" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full border-none focus:outline-none text-sm text-gray-900 placeholder-gray-500"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
  
            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
  
            {/* 로그인 버튼 */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                로그인
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            접속한 IP 정보: {ip || '불러오는 중...'}
          </p>

        </div>
      </div>
    </div>
  );
  

};

export default AdminLogin;

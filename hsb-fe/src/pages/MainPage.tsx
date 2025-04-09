// src/pages/MainPage.tsx
import React from 'react';
import Layout from '../components/Layout/Layout';

const MainPage = () => {
  return (
    <Layout>
      <h2 className="text-3xl font-semibold mb-4">HSB CMS 메인 페이지</h2>
      <p className="text-gray-700">이곳은 HSB 콘텐츠 관리 시스템의 시작점입니다.</p>


      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/_g1XBLBZTmA?si=0yCcXKzPz6OIhveZ"
        title="YouTube video player"
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin" 
        allowFullScreen 
      ></iframe>   
 </Layout>
  );
};

export default MainPage;

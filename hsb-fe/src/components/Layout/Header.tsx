import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header style={{ background: '#eee', padding: '1rem' }}>
        <h1>HSB CMS</h1>
        <nav>
          <Link to="/" style={{ marginRight: '1rem' }}>홈</Link>
          <Link to="/news" style={{ marginRight: '1rem' }}>뉴스</Link>
          <Link to="/prom" style={{ marginRight: '1rem' }}>홍보자료</Link>
          <Link to="/event" style={{ marginRight: '1rem' }}>이벤트</Link>
          <Link to="/media" style={{ marginRight: '1rem' }}>미디어</Link>
        </nav>
      </header>
    );
};

export default Header;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Gnb = () => {
  const navigate = useNavigate();

  return (
    <header style={{
      height: '60px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 1000, boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 900 }} onClick={() => navigate('/')}>
          🔖 Galpi
        </h2>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <Link to="/" style={linkStyle}>대문</Link>
          <Link to="/category" style={linkStyle}>작품 분류</Link>
          <Link to="/memo" style={linkStyle}>메모 캔버스</Link>
          <Link to="/bulk" style={linkStyle}>일괄 관리</Link>
        </nav>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => navigate('/guide')} style={{ background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          📖 시스템 가이드
        </button>
      </div>
    </header>
  );
};

const linkStyle = { textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '14px' };
export default Gnb;
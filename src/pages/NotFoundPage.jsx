import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '80px', margin: 0, color: 'var(--primary-color)' }}>404</h1>
      <h2 style={{ color: 'var(--text-primary)' }}>페이지를 찾을 수 없습니다</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        주소가 잘못 입력되었거나, 삭제 및 이동된 문서일 수 있습니다.
      </p>
      <button 
        onClick={() => navigate('/')}
        style={{ padding: '10px 24px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        🏠 대문으로 돌아가기
      </button>
    </div>
  );
};

export default NotFoundPage;
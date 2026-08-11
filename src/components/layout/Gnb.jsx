// 파일 위치: src/components/layout/Gnb.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconGear, IconPalette, IconMoon, IconPlus } from '../common/icons/DomainIcons';

// App.jsx에서 setIsSettingOpen 함수를 넘겨받습니다.
const Gnb = ({ setIsSettingOpen }) => {
  const navigate = useNavigate();

  const toggleDark = () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('wiki-theme', isDark ? 'light' : 'dark');
  };

  return (
    <header style={{ height: '60px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/')}>
          <img src="/img/svg/ci.svg" alt="Galpi CI 로고" style={{ height: '24px' }} onError={(e) => e.target.style.display='none'} />
          갈피(galpi)
        </h2>
      </div>
      
      {/* 중앙 검색창 */}
      <div style={{ flex: 1, maxWidth: '600px', margin: '0 20px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, display: 'flex', alignItems: 'center' }}>
          <IconSearch size={16} />
        </div>
        <input type="text" placeholder="작품명, 장르, 약칭 검색 후 엔터..." style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
      </div>

      {/* 우측 컨트롤 및 버튼 영역 (전면 SVG 벡터 아이콘 적용) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => setIsSettingOpen(true)} style={iconBtnStyle} title="환경 설정">
          <IconGear size={20} color="var(--text-secondary)" />
        </button>
        <button style={iconBtnStyle} title="테마 색상 변경">
          <IconPalette size={20} color="var(--text-secondary)" />
        </button>
        <button onClick={toggleDark} style={iconBtnStyle} title="다크 모드 전환">
          <IconMoon size={20} color="var(--text-secondary)" />
        </button>
        <button className="wiki-btn" onClick={() => navigate('/edit?type=work&action=new')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' }}>
          <IconPlus size={16} /> 새 작품 등록
        </button>
      </div>
    </header>
  );
};

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' };
export default Gnb;
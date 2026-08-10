import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../PageMemo.module.css';
import { HomeIcon, SearchIcon, FilePlusIcon } from '../../shared/components/MemoIcons';

const PageMemoHeader = ({ searchQuery, setSearchQuery, handleOpenTab }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.memoTopBar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button className="wiki-btn" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HomeIcon /> 홈으로
        </button>
        <h1 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)', fontWeight: 900 }}>메모장</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', display: 'flex' }}><SearchIcon /></span>
          <input
            type="text"
            placeholder="메모 제목 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px 6px 32px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none', width: '240px', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
          />
        </div>

        <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', color: 'white' }} onClick={() => handleOpenTab(null, 'main')}>
          <FilePlusIcon /> 새 메모 작성
        </button>
      </div>
    </header>
  );
};

export default PageMemoHeader;
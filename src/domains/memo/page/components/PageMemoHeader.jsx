import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../PageMemo.module.css';
import { HomeIcon, SearchIcon, FilePlusIcon, BookIcon } from '../../shared/components/MemoIcons';

const PageMemoHeader = ({ searchQuery, setSearchQuery, searchScope, setSearchScope, handleOpenTab }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.memoTopBar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button className="wiki-btn" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HomeIcon /> 홈으로
        </button>
        <h1 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'flex', color: 'var(--primary-color)' }}><BookIcon /></span> 메모장
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* ★ 고급 검색 필터 탑재 */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', paddingLeft: '8px' }}>
          <select
            value={searchScope}
            onChange={e => setSearchScope(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '12px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', padding: '4px 2px 4px 4px' }}
          >
            <option value="all">제목+내용</option>
            <option value="title">제목만</option>
            <option value="content">내용만</option>
          </select>
          <div style={{ width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 4px' }}></div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '8px', color: 'var(--text-secondary)', display: 'flex' }}><SearchIcon /></span>
            <input
              type="text"
              placeholder="검색어 입력..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px 6px 28px', border: 'none', fontSize: '13px', outline: 'none', width: '180px', background: 'transparent', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', color: 'white' }} onClick={() => handleOpenTab(null, 'main')}>
          <FilePlusIcon /> 새 메모 작성
        </button>
      </div>
    </header>
  );
};

export default PageMemoHeader;
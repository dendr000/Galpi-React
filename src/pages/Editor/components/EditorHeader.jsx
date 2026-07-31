// 파일 위치: src/pages/Editor/components/EditorHeader.jsx
import React from 'react';
import styles from '../EditorPage.module.css';

const EditorHeader = ({ badgeText, saveStatus, layoutMode, setLayoutMode, handleGoBack, handleSave }) => {
  return (
    <header className={styles.editorHeader}>
      <div className={styles.headerLeft}>
        <button 
          className="wiki-btn" 
          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} 
          onClick={handleGoBack}
        >
          ⬅ 돌아가기
        </button>
        <span className={styles.modeBadge}>{badgeText}</span>
        
        {/* 자동 저장 상태 인디케이터 */}
        <span style={{ fontSize: '13px', fontWeight: 'bold', marginLeft: '10px', transition: '0.3s' }}>
            {saveStatus === 'saving' && <span style={{ color: 'var(--text-secondary)' }}>⏳ 저장 중...</span>}
            {saveStatus === 'saved' && <span style={{ color: '#10b981' }}>✅ 저장됨</span>}
            {saveStatus === 'error' && <span style={{ color: '#e53e3e' }}>❌ 저장 실패</span>}
        </span>
      </div>

      <div className={styles.headerRight}>
        {/* 에디터 레이아웃 스위처 */}
        <div style={{ display: 'flex', gap: '4px', marginRight: '15px', background: 'var(--table-bg-alt)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <button 
                onClick={() => setLayoutMode('focus')} 
                style={{ background: layoutMode === 'focus' ? 'var(--surface-color)' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: layoutMode === 'focus' ? 'bold' : 'normal', color: layoutMode === 'focus' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                title="타이핑 집중 모드 (에디터 100%)"
            >
                📝 집중
            </button>
            <button 
                onClick={() => setLayoutMode('dual')} 
                style={{ background: layoutMode === 'dual' ? 'var(--surface-color)' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: layoutMode === 'dual' ? 'bold' : 'normal', color: layoutMode === 'dual' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                title="듀얼 뷰 (에디터 50 : 프리뷰 50)"
            >
                ⚖️ 듀얼
            </button>
            <button 
                onClick={() => setLayoutMode('preview')} 
                style={{ background: layoutMode === 'preview' ? 'var(--surface-color)' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: layoutMode === 'preview' ? 'bold' : 'normal', color: layoutMode === 'preview' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                title="미리보기 모드 (프리뷰 100%)"
            >
                👁️ 뷰어
            </button>
        </div>

        <button 
          className="wiki-btn" 
          style={{ background: 'var(--primary-color)', color: 'white', fontWeight: 'bold' }} 
          onClick={() => handleSave(false)}
        >
          💾 출간하기 (수동 저장)
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;
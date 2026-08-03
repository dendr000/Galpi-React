// 파일 위치: src/components/layout/fab/memo/MemoEditorHeader.jsx
// 기능 요약: FAB 메모장의 상단 제목 입력, 저장 상태 표시, 워크스페이스 이동 버튼을 렌더링하는 UI 컴포넌트

import React from 'react';

const MemoEditorHeader = ({
  titleRef,
  handleTitleKeyDown,
  charCount,
  navigate,
  saveMemo,
  isSaving
}) => {
  return (
    <div className="memo-editor-header" style={{ display: 'flex', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', gap: '10px', alignItems: 'center', background: 'var(--surface-color)' }}>
      <input 
        ref={titleRef} type="text" placeholder="메모 제목" 
        style={{ flex: 1, fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
        onKeyDown={handleTitleKeyDown}
      />
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginRight: '10px' }} id="memo-char-count">
        {charCount.selected > 0 ? `${charCount.selected} / ${charCount.total}` : `0 / ${charCount.total}`}
      </div>
      <button 
        className="memo-btn" title="메모 페이지로 이동"
        style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
        onClick={() => navigate('/memo')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </button>
      <button 
        onClick={saveMemo} 
        style={{ background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: isSaving ? '90px' : 'auto', whiteSpace: 'nowrap' }}
      >
        {isSaving ? "✅ 저장됨" : "💾 저장"}
      </button>
    </div>
  );
};

export default MemoEditorHeader;
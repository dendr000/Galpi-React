// 파일 위치: src/domains/memo/fab/components/FabMemoEditorHeader.jsx
import React from 'react';
import { ExternalLinkIcon, SaveIcon, CheckCircleIcon } from '../../shared/components/MemoIcons';

const FabMemoEditorHeader = ({
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
        <ExternalLinkIcon />
      </button>
      <button 
        onClick={saveMemo} 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: isSaving ? '#10b981' : 'var(--primary-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: isSaving ? '90px' : 'auto', whiteSpace: 'nowrap' }}
      >
        {isSaving ? <><CheckCircleIcon /> 저장됨</> : <><SaveIcon /> 저장</>}
      </button>
    </div>
  );
};

export default FabMemoEditorHeader;
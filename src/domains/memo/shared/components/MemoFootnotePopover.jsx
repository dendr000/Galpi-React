// 파일 위치: src/domains/memo/shared/components/MemoFootnotePopover.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PinIcon, XIcon, TrashIcon, SaveIcon } from './MemoIcons';

const MemoFootnotePopover = ({ popover, closePopover, switchToEdit, updateFootnote, deleteFootnote, timeoutRef }) => {
  const popoverRef = useRef(null);
  const textareaRef = useRef(null); 
  const [adjustedX, setAdjustedX] = useState(0);

  useEffect(() => {
    if (popover.isOpen && popover.mode === 'edit') {
      if (textareaRef.current) {
        textareaRef.current.value = popover.content || '';
        textareaRef.current.focus();
      }
    }
  }, [popover.isOpen, popover.mode, popover.content]);

  useEffect(() => {
    if (popover.isOpen && popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      let safeX = popover.x;
      if (safeX + rect.width > window.innerWidth) {
        safeX = window.innerWidth - rect.width - 15;
      }
      setAdjustedX(safeX);
    }
  }, [popover.isOpen, popover.x, popover.mode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popover.isOpen && popover.mode === 'edit' && popoverRef.current && !popoverRef.current.contains(e.target)) {
        if (!e.target.closest('.memo-footnote')) {
          closePopover();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popover.isOpen, popover.mode, closePopover]);

  if (!popover.isOpen) return null;

  // [모드 1] 마우스 호버 시 보여주는 뷰 모드
  if (popover.mode === 'view') {
    return (
      <div
        ref={popoverRef}
        onMouseEnter={() => clearTimeout(timeoutRef.current)}
        onMouseLeave={() => closePopover()}
        onClick={switchToEdit}
        style={{
          position: 'fixed',
          top: popover.y,
          left: adjustedX || popover.x,
          zIndex: 999999,
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          borderRadius: '6px',
          padding: '10px 14px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          maxWidth: '350px',
          width: 'max-content',
          cursor: 'pointer',
          fontSize: '13px',
          lineHeight: 1.6,
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap', 
          boxSizing: 'border-box'
        }}
      >
        {popover.content || <span style={{ color: '#aaa' }}>내용이 비어있습니다. (클릭하여 편집)</span>}
      </div>
    );
  }

  // [모드 2] 클릭 시 나타나는 입력/수정/삭제 모달 패널 (넓이 360px로 확장 및 SVG 적용)
  return (
    <div
      ref={popoverRef}
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      style={{
        position: 'fixed',
        top: popover.y,
        left: adjustedX || popover.x,
        zIndex: 999999,
        background: 'var(--surface-color)',
        border: '2px solid var(--primary-color)',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        width: '360px',
        maxWidth: '90vw',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PinIcon size={14} /> 각주 편집
          </span>
          <button onClick={closePopover} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px', transition: '0.2s' }}>
            <XIcon size={16} />
          </button>
        </div>
        
        <textarea
          ref={textareaRef} 
          placeholder="각주 설명을 상세히 입력하세요..."
          style={{ width: '100%', minHeight: '120px', padding: '10px', fontSize: '13px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.5' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <button className="wiki-btn" onClick={deleteFootnote} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '11.5px', background: 'transparent', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            <TrashIcon /> 삭제
          </button>
          
          <button className="wiki-btn" onClick={() => updateFootnote(textareaRef.current.value)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 16px', fontSize: '11.5px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            <SaveIcon /> 적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoFootnotePopover;
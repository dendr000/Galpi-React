// 파일 위치: src/domains/memo/components/MemoFootnotePopover.jsx
import React, { useState, useEffect, useRef } from 'react';

const MemoFootnotePopover = ({ popover, closePopover, switchToEdit, updateFootnote, deleteFootnote, timeoutRef }) => {
  const [editValue, setEditValue] = useState('');
  const popoverRef = useRef(null);
  const [adjustedX, setAdjustedX] = useState(0);

  useEffect(() => {
    if (popover.isOpen && popover.mode === 'edit') {
      setEditValue(popover.content);
    }
  }, [popover.isOpen, popover.mode, popover.content]);

  // ★ fixed 기반 자동 좌표 보정 (우측 잘림 방지)
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

  // ★ 편집 모드일 때만 외부 클릭 시 닫기
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

  // ==========================================
  // [모드 1] 마우스 호버 시: 나무위키 스타일의 까만색 심플 툴팁
  // ==========================================
  if (popover.mode === 'view') {
    return (
      <div
        ref={popoverRef}
        onMouseEnter={() => clearTimeout(timeoutRef.current)}
        onMouseLeave={() => closePopover()}
        onClick={switchToEdit} // 툴팁을 클릭하면 편집 모드로 즉시 변환
        style={{
          position: 'fixed', // ★ absolute에서 fixed로 변경하여 뷰포트 좌표 일치
          top: popover.y,
          left: adjustedX || popover.x,
          zIndex: 999999,
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          maxWidth: '300px',
          cursor: 'pointer',
          fontSize: '12px',
          lineHeight: 1.5,
          wordBreak: 'keep-all',
          whiteSpace: 'pre-wrap', // ★ HTML이 줄바꿈(\n)을 띄어쓰기로 뭉개지 않고 그대로 렌더링하도록 강제
          boxSizing: 'border-box'
        }}
      >
        {popover.content || <span style={{ color: '#aaa' }}>내용이 비어있습니다. (클릭하여 편집)</span>}
      </div>
    );
  }

  // ==========================================
  // [모드 2] 클릭 시: 노션 스타일의 입력/수정/삭제 모달 패널
  // ==========================================
  return (
    <div
      ref={popoverRef}
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      style={{
        position: 'fixed', // ★ absolute에서 fixed로 변경하여 뷰포트 좌표 일치
        top: popover.y,
        left: adjustedX || popover.x,
        zIndex: 999999,
        background: 'var(--surface-color)',
        border: '2px solid var(--primary-color)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        width: '260px',
        maxWidth: '85vw',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)' }}>📌 각주 편집</span>
          <button onClick={closePopover} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', padding: 0 }}>✖</button>
        </div>
        <textarea
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="각주 설명을 입력하세요..."
          style={{ width: '100%', height: '80px', padding: '8px', fontSize: '13px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <button className="wiki-btn" onClick={deleteFootnote} style={{ padding: '4px 8px', fontSize: '11px', background: 'transparent', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '4px' }}>🗑️ 삭제</button>
          <button className="wiki-btn" onClick={() => updateFootnote(editValue)} style={{ padding: '4px 12px', fontSize: '11px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>💾 적용</button>
        </div>
      </div>
    </div>
  );
};

export default MemoFootnotePopover;
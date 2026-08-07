// 파일 위치: src/components/layout/footer/components/FontDictRow.jsx
// 기능 요약: 파일명(Key)과 매핑될 한글명(Value)을 1:1로 렌더링. 기존 파일명은 읽기 전용 및 클릭 복사 지원. 신규 항목은 입력 허용.

import React from 'react';
import { CloseIcon } from './FooterIcons';

const FontDictRow = ({ item, onChange, onRemove }) => {
  const handleKeyClick = async (e) => {
    // 기존에 등록된 항목(isNew === false)일 경우에만 클릭 시 클립보드 복사 발동
    if (!item.isNew && item.key) {
      try {
        await navigator.clipboard.writeText(item.key);
        const inputEl = e.target;
        const originalBg = inputEl.style.background;
        inputEl.style.background = 'var(--primary-color)';
        inputEl.style.color = 'white';
        setTimeout(() => {
          inputEl.style.background = originalBg;
          inputEl.style.color = 'var(--text-primary)';
        }, 200);
      } catch (err) {
        console.error("복사 실패:", err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
      <input 
        type="text" 
        value={item.key} 
        onChange={(e) => item.isNew && onChange(item.id, 'key', e.target.value)}
        readOnly={!item.isNew}
        onClick={handleKeyClick}
        placeholder="영문 파일명"
        title={!item.isNew ? "클릭하여 복사" : "매핑할 파일명 입력"}
        style={{ 
          flex: 1, 
          padding: '6px 10px', 
          fontSize: '13px', 
          borderRadius: '4px', 
          border: '1px solid var(--border-color)', 
          background: item.isNew ? 'var(--bg-color)' : 'var(--table-bg-alt)',
          color: 'var(--text-primary)',
          outline: 'none',
          cursor: item.isNew ? 'text' : 'copy',
          transition: 'background 0.2s, color 0.2s'
        }} 
      />
      <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>:</span>
      <input 
        type="text" 
        value={item.val} 
        onChange={(e) => onChange(item.id, 'val', e.target.value)}
        placeholder="표시할 한글명"
        style={{ 
          flex: 1, 
          padding: '6px 10px', 
          fontSize: '13px', 
          borderRadius: '4px', 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-color)',
          color: 'var(--text-primary)',
          outline: 'none'
        }} 
      />
      <button 
        onClick={() => onRemove(item.id)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          cursor: 'pointer', 
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: '0.2s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = '#e53e3e'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        title="항목 삭제"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
};

export default FontDictRow;
// src/components/common/ModalOverlay.jsx
import React, { useEffect } from 'react';

const ModalOverlay = ({ title, onClose, children, width = '500px', actions }) => {
  useEffect(() => {
    return () => {};
  }, [title]);

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={(e) => e.stopPropagation()} // ★ 추가: 외부 클릭 센서(mousedown)가 반응하지 못하도록 원천 차단
      onClick={(e) => { e.stopPropagation(); onClose(); }} // ★ 추가: 클릭 이벤트 전파 차단
      style={{ zIndex: 100000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div 
        className="modal-content" 
        onMouseDown={(e) => e.stopPropagation()} // ★ 추가: 모달 내부 클릭 시 차단
        onClick={(e) => e.stopPropagation()} 
        style={{ background: 'var(--bg-color)', width: '90%', maxWidth: width, maxHeight: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}
      >
        <div style={{ padding: '15px 25px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '16px' }}>{title}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {actions}
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1 }}
            >
              &times;
            </button>
          </div>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalOverlay;
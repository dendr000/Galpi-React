// src/components/common/ModalOverlay.jsx
import React, { useEffect } from 'react';

const ModalOverlay = ({ title, onClose, children, width = '500px', actions }) => {
  useEffect(() => {
    return () => {};
  }, [title]);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ zIndex: 100000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div 
        className="modal-content" 
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
// 파일 위치: src/domains/memo/components/MemoBookmarkModal.jsx
// (Alt+G를 누르면 화면 중앙에 떠서 목록을 쫙 뿌려주는 팝업 인터페이스입니다.)

import React from 'react';
import { BookmarkIcon, NavigationIcon, XIcon } from './MemoIcons';

const MemoBookmarkModal = ({ isOpen, bookmarks, onClose, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)' }}
      onMouseDown={onClose}
    >
      <div
        style={{ width: '320px', background: 'var(--surface-color)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--table-bg-alt)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            <NavigationIcon /> 찾아가기
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="닫기">
            <XIcon size={16} />
          </button>
        </div>

        <div className="galpi-sidebar-scroll" style={{ padding: '10px', maxHeight: '350px', overflowY: 'auto' }}>
          {bookmarks.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>
              등록된 책갈피가 없습니다.
            </div>
          ) : (
            bookmarks.map(bm => (
              <div
                key={bm.id}
                onClick={() => onNavigate(bm.id)}
                style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s', borderBottom: '1px solid var(--border-color)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59,91,219,0.08)';
                  e.currentTarget.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}><BookmarkIcon /></span>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{bm.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoBookmarkModal;
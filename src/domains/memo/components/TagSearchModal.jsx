// 파일 위치: src/domains/memo/components/TagSearchModal.jsx
import React from 'react';
import { TagIcon, FileTextIcon, XIcon, FolderIcon } from './MemoIcons';

const TagSearchModal = ({ tag, memoData, onClose, onSelectMemo }) => {
  if (!tag) return null;

  // 선택된 태그를 포함하고 있는 메모들만 필터링 (휴지통 제외)
  const relatedMemos = memoData.filter(m => 
    !m.isTrash && m.tags && m.tags.split(',').map(t => t.trim()).includes(tag)
  ).sort((a, b) => b.updatedAt - a.updatedAt); // 최신순 정렬

  return (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999999, 
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)'
      }}
      onMouseDown={onClose}
    >
      <div 
        style={{
          width: '500px', maxWidth: '90vw', maxHeight: '70vh', background: 'var(--surface-color)', 
          borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border-color)', overflow: 'hidden'
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', background: 'rgba(59, 91, 219, 0.05)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '900', color: 'var(--primary-color)' }}>
            <TagIcon /> #{tag} 연관 메모 보관함
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
            <XIcon size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {relatedMemos.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>
              연관된 다른 메모가 없습니다.
            </div>
          ) : (
            relatedMemos.map(m => (
              <div 
                key={m.id}
                onClick={() => {
                  onSelectMemo(m.id);
                  onClose();
                }}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 15px',
                  borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--table-bg-alt)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileTextIcon />
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{m.title || '제목 없음'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FolderIcon /> {m.folder}</span>
                  <span>{new Date(m.updatedAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TagSearchModal;
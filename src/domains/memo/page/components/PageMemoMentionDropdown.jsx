// 파일 위치: src/domains/memo/page/components/PageMemoMentionDropdown.jsx
// 기능 요약: 에디터에서 @ 입력 시 렌더링되는 검색 자동완성 드롭다운 UI
import React from 'react';
import { BookIcon, UserIcon } from '../../shared/components/MemoIcons';

const PageMemoMentionDropdown = ({
  mentionState,
  mentionCandidates,
  handleMentionSelect
}) => {
  if (!mentionState.isOpen) return null;

  const filteredMentions = mentionCandidates.filter(item => 
    item.name && item.name.toLowerCase().includes(mentionState.query.toLowerCase())
  );

  return (
    <div 
      style={{
        position: 'fixed', left: mentionState.x, top: mentionState.y, zIndex: 999999,
        background: 'var(--surface-color)', border: '1px solid var(--primary-color)',
        borderRadius: '8px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)', width: '220px',
        maxHeight: '220px', overflowY: 'auto'
      }}
      onMouseDown={(e) => {
        e.stopPropagation(); 
      }} 
    >
      <div style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)' }}>
        멘션 삽입 (클릭하여 추가)
      </div>
      
      {filteredMentions.length > 0 ? filteredMentions.map(item => (
        <div 
          key={`${item.type}-${item.id}`}
          style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '13px', display: 'flex', alignItems: 'center' }}
          onMouseDown={(e) => { 
            e.preventDefault();
            handleMentionSelect(item); 
          }} 
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginRight: '8px', minWidth: '50px' }}>
            {item.type === 'work' ? <><BookIcon /> 작품</> : <><UserIcon /> 인물</>}
          </span>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.name}</span>
        </div>
      )) : (
        <div style={{ padding: '15px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
};

export default PageMemoMentionDropdown;
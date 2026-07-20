// 파일 위치: src/pages/MemoWorkspace/editor/MentionDropdown.jsx
// 기능 요약: @ 멘션 활성화 시 나타나는 검색 자동완성 드롭다운 UI 컴포넌트 (출력 제한 해제)
// 버전: v1.1.0

import React from 'react';

const MentionDropdown = ({
  mentionState,
  mentionCandidates,
  handleMentionSelect
}) => {
  console.log(`[MentionDropdown] 멘션 팝업 렌더링. 쿼리 상태: ${mentionState.query}`);

  if (!mentionState.isOpen) return null;

  // 멘션 쿼리에 따른 필터링 연산 수행 (개수 제한 slice 제거)
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
        console.log("[MentionDropdown] 팝업 내부 마우스 다운 감지 (전파 차단)");
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
            console.log(`[MentionDropdown] 멘션 아이템 선택됨: ${item.name}`);
            e.preventDefault(); // 에디터 커서 포커스 상실 방지
            handleMentionSelect(item); 
          }} 
        >
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '8px', minWidth: '40px' }}>
            {item.type === 'work' ? '📘 작품' : '👤 인물'}
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

export default MentionDropdown;
// 파일 위치: src/pages/Editor/components/BacklinkDropdown.jsx
// 기능 요약: 에디터에서 [[ 입력 시 커서 아래에 즉각적으로 노출되는 위키 백링크 추천 및 자동완성 모달
import React, { useEffect, useRef } from 'react';

const BacklinkDropdown = ({ isOpen, x, y, query, candidates, selectedIndex, onSelect }) => {
  const listRef = useRef(null);

  // 방향키 이동 시 스크롤 포커스 자동 추적
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  const filtered = (candidates || []).filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, zIndex: 100000,
        background: 'var(--surface-color)', border: '1px solid var(--primary-color)',
        borderRadius: '8px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        width: '260px', maxHeight: '280px', display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}
      onMouseDown={(e) => e.preventDefault()} // 에디터 입력창의 포커스 상실 방지
    >
      <div style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)' }}>
        🔗 백링크 연결 (Enter로 선택)
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length > 0 ? filtered.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={`${item.type}-${item.id}`}
              style={{
                padding: '10px 12px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center',
                background: isSelected ? 'var(--table-bg-alt)' : 'transparent',
                borderBottom: '1px solid var(--border-color)', color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: isSelected ? 'bold' : 'normal'
              }}
              onClick={() => onSelect(item.name)}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '8px', minWidth: '40px' }}>
                {item.type === 'work' ? '📚 작품' : '👤 인물'}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
            </div>
          );
        }) : (
          <div style={{ padding: '15px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklinkDropdown;
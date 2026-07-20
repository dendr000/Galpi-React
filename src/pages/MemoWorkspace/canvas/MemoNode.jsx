// 파일 위치: src/pages/MemoWorkspace/canvas/MemoNode.jsx
// 기능 요약: 캔버스 뷰에서 개별 메모를 렌더링하는 커스텀 노드. 잠금, 휴지통 이관 기능 및 중앙 연결 핸들 포함.
// 버전: v1.0.0

import React from 'react';
import { Handle, Position } from '@xyflow/react';

const MemoNode = ({ data, selected }) => {
  const { memo, onEdit, onToggleLock, onMoveToTrash } = data;
  const isLocked = memo.isLocked;

  return (
    <div 
      style={{
        width: 260,
        background: 'var(--surface-color)',
        borderRadius: '8px',
        border: `2px solid ${selected ? '#e53e3e' : 'var(--border-color)'}`,
        borderTop: `6px solid ${memo.themeColor || 'var(--primary-color)'}`,
        boxShadow: selected ? '0 10px 30px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        opacity: memo.isTrash ? 0.6 : 1,
        transition: 'box-shadow 0.2s, border 0.2s'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 360도 어디서든 선이 중앙을 향하도록 투명한 타겟/소스 핸들 정중앙 배치 */}
      <Handle type="target" position={Position.Top} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, position: 'absolute' }} />
      <Handle type="source" position={Position.Bottom} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, position: 'absolute' }} />

      {/* 노드 헤더 (이 부분을 잡아야만 드래그 가능하도록 custom-drag-handle 클래스 부여) */}
      <div 
        className={isLocked ? "" : "custom-drag-handle"} 
        style={{ 
          padding: '12px 15px 8px 15px', 
          borderBottom: '1px solid var(--border-color)', 
          cursor: isLocked ? 'not-allowed' : 'move',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <div style={{ fontWeight: 900, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>
          {memo.title || '제목 없음'}
        </div>
        <button 
          onClick={() => onToggleLock(memo)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', opacity: isLocked ? 1 : 0.3 }}
          title={isLocked ? "위치 잠금 해제" : "위치 잠금"}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
      </div>

      {/* 노드 본문 미리보기 */}
      <div style={{ padding: '15px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <div style={{ marginBottom: '10px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-all' }}>
          {memo.content ? memo.content.replace(/<[^>]*>?/gm, '').trim() : "내용 없음"}
        </div>
        
        {/* 태그 표시 영역 */}
        {memo.tags && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {memo.tags.split(',').map((tag, idx) => (
              <span key={idx} style={{ background: 'var(--table-bg-alt)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* 액션 버튼 그룹 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="wiki-btn" 
            style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)' }} 
            onClick={() => onEdit(memo)}
          >
            ✏️ 편집
          </button>
          {!memo.isTrash && (
            <button 
              className="wiki-btn" 
              style={{ padding: '4px 8px', fontSize: '11px', background: 'transparent', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)' }} 
              onClick={() => onMoveToTrash(memo)}
            >
              🗑️ 휴지통
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoNode;
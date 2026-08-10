// 파일 위치: src/domains/memo/page/canvas/PageMemoNode.jsx
// 기능 요약: 캔버스 뷰에서 개별 메모를 렌더링하는 커스텀 노드. 잠금, 휴지통 이관 기능 및 중앙 연결 핸들 포함.
// 버전: v1.0.0

import React from 'react';
import { Handle, Position } from '@xyflow/react';

const PageMemoNode = ({ data, selected }) => {
  const { memo, onEdit, onToggleLock, onMoveToTrash } = data;
  const isLocked = memo.isLocked;

 return (
    <div 
      style={{
        width: 260,
        background: 'var(--surface-color)',
        borderRadius: '8px',
        borderStyle: 'solid',
        borderWidth: '2px',
        borderColor: selected ? '#e53e3e' : 'var(--border-color)',
        borderTopWidth: '6px',
        borderTopColor: memo.themeColor || 'var(--primary-color)',
        boxShadow: selected ? '0 10px 30px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        opacity: memo.isTrash ? 0.6 : 1,
        transition: 'box-shadow 0.2s, border-color 0.2s'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Handle type="target" position={Position.Top} style={{ width: '12px', height: '12px', background: 'var(--primary-color)', border: '2px solid var(--surface-color)', zIndex: 10 }} />
      <Handle type="source" position={Position.Bottom} style={{ width: '12px', height: '12px', background: 'var(--primary-color)', border: '2px solid var(--surface-color)', zIndex: 10 }} />
      <Handle type="source" position={Position.Left} id="left-src" style={{ width: '12px', height: '12px', background: 'var(--primary-color)', border: '2px solid var(--surface-color)', zIndex: 10 }} />
      <Handle type="target" position={Position.Right} id="right-tgt" style={{ width: '12px', height: '12px', background: 'var(--primary-color)', border: '2px solid var(--surface-color)', zIndex: 10 }} />

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

      <div style={{ padding: '15px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <div style={{ marginBottom: '10px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-all' }}>
          {memo.content ? memo.content.replace(/<[^>]*>?/gm, '').trim() : "내용 없음"}
        </div>
        
        {memo.tags && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {memo.tags.split(',').map((tag, idx) => (
              <span 
                key={idx} 
                style={{ background: 'var(--table-bg-alt)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (data.onTagClick) data.onTagClick(tag.trim()); 
                }}
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

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

export default PageMemoNode;
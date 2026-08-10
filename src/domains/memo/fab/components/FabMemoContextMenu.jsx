// 파일 위치: src/domains/memo/fab/components/FabMemoContextMenu.jsx
import React from 'react';
import { FolderIcon, TrashIcon } from '../../shared/components/MemoIcons';

const FabMemoContextMenu = ({ 
  menuData, menuRef, memoFolders, memoData: allMemos, 
  executeMoveMemo, deleteMemo 
}) => {
  if (!menuData.isOpen) return null;

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: menuData.y, left: menuData.x, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 99999, display: 'flex', flexDirection: 'column', minWidth: '180px', maxHeight: '400px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'default' }}>
        <FolderIcon /> 이동할 폴더 선택
      </div>
      
      {memoFolders.sort().filter(f => f !== "기타").map(f => {
        const targetMemo = allMemos.find(m => String(m.id) === String(menuData.memoId));
        const isCurrent = targetMemo?.folder === f;
        const depth = f.split('/').length - 1;
        const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(depth);
        const displayName = f.split('/').pop();

        return (
          <div 
            key={f} className="memo-move-item" 
            onClick={() => !isCurrent && executeMoveMemo(f)} 
            style={{ 
              opacity: isCurrent ? 0.4 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer', 
              padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', 
              transition: '0.2s', display: 'flex', alignItems: 'center', gap: '6px' 
            }} 
            onMouseOver={(e) => { if(!isCurrent) { e.currentTarget.style.background = 'var(--table-bg-alt)'; e.currentTarget.style.color = 'var(--primary-color)'; } }} 
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <span>{indent}</span><FolderIcon /> {displayName} {isCurrent ? '(현재)' : ''}
          </div>
        );
      })}
      
      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0', flexShrink: 0 }}></div>
      
      <div 
        className="memo-move-item" 
        onClick={deleteMemo} 
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e53e3e', fontWeight: 900, padding: '8px 12px', fontSize: '12px', cursor: 'pointer', transition: '0.2s', flexShrink: 0 }} 
        onMouseOver={(e) => e.currentTarget.style.background = 'var(--table-bg-alt)'} 
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <TrashIcon /> 영구 삭제
      </div>
    </div>
  );
};

export default FabMemoContextMenu;
// 파일 위치: src/domains/memo/fab/components/FabMemoSmartFolders.jsx
import React from 'react';
import { ClockIcon, HelpIcon } from '../../shared/components/MemoIcons';

const FabMemoSmartFolders = ({ currentFolder, setCurrentFolder }) => {
  return (
    <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ display: 'inline-block', padding: '0 8px', fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        스마트 폴더
      </span>
      {[
        { id: '최근 7일', icon: <ClockIcon size={14} /> },
        { id: '미분류', icon: <HelpIcon size={14} /> }
      ].map(sf => (
        <div
          key={sf.id}
          className="galpi-tree-folder"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 8px', borderRadius: '4px', cursor: 'pointer',
            background: currentFolder === sf.id ? 'rgba(59,91,219,0.08)' : 'transparent',
            color: currentFolder === sf.id ? 'var(--primary-color)' : 'var(--text-primary)',
            fontWeight: 'bold', fontSize: '13px', transition: 'background 0.2s'
          }}
          onClick={() => setCurrentFolder(sf.id)}
        >
          <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>{sf.icon}</span>
          <span>{sf.id}</span>
        </div>
      ))}
    </div>
  );
};

export default FabMemoSmartFolders;
// 파일 위치: src/domains/memo/page/components/PageMemoTreeRenderer.jsx
import React from 'react';
import { FolderIcon, FolderPlusIcon, EditIcon, TrashIcon, FoldIcon } from '../../shared/components/MemoIcons';

const PageMemoTreeRenderer = ({ node, treeHooks, currentFolder, setCurrentFolder, handleAddFolder, handleEditFolder, handleDeleteFolder, memos }) => {
  const isRoot = node.depth === -1;

  return (
    <div style={{ paddingLeft: isRoot ? 0 : '16px', minHeight: '5px' }}>
      {Object.values(node.children).map((childNode) => {
        const isChildExpanded = treeHooks.expandedFolders[childNode.path];
        const isActive = currentFolder === childNode.path;

        return (
          <div key={`folder_${childNode.path}`}>
            <div
              className="galpi-tree-folder"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                background: isActive ? 'rgba(59,91,219,0.1)' : 'transparent',
                color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                fontWeight: 'bold', fontSize: '13px', transition: 'all 0.15s',
                marginBottom: '3px'
              }}
              onClick={() => {
                treeHooks.toggleFolder(childNode.path);
                setCurrentFolder(childNode.path);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', opacity: 0.6, transform: isChildExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s ease' }}>
                  <FoldIcon />
                </span>
                <FolderIcon />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {childNode.name}
                </span>
              </div>
              
              <div className="folder-actions" style={{ display: isActive ? 'flex' : 'none', gap: '4px' }}>
                {childNode.path !== '전체 메모' && childNode.path !== '기타' && (
                  <>
                    <button className="wiki-btn" onClick={(e) => { e.stopPropagation(); handleAddFolder(childNode.path); }} style={{ background:'transparent', border:'none', color:'var(--text-secondary)', padding:'2px', display:'flex' }} title="하위 폴더 추가"><FolderPlusIcon /></button>
                    <button className="wiki-btn" onClick={(e) => { e.stopPropagation(); handleEditFolder(childNode.path); }} style={{ background:'transparent', border:'none', color:'var(--text-secondary)', padding:'2px', display:'flex' }} title="이름 변경"><EditIcon /></button>
                    <button className="wiki-btn" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(childNode.path); }} style={{ background:'transparent', border:'none', color:'#e53e3e', padding:'2px', display:'flex' }} title="삭제"><TrashIcon /></button>
                  </>
                )}
              </div>
              
              {(!isActive || childNode.path === '전체 메모' || childNode.path === '기타') && (
                 <span style={{ fontSize: '11px', opacity: 0.6 }}>
                    {childNode.path === '전체 메모' ? memos.length : memos.filter(m => m.folder === childNode.path || m.folder?.startsWith(`${childNode.path}/`)).length}
                 </span>
              )}
            </div>

            {isChildExpanded && (
              <PageMemoTreeRenderer
                node={childNode}
                treeHooks={treeHooks}
                currentFolder={currentFolder}
                setCurrentFolder={setCurrentFolder}
                handleAddFolder={handleAddFolder}
                handleEditFolder={handleEditFolder}
                handleDeleteFolder={handleDeleteFolder}
                memos={memos}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PageMemoTreeRenderer;
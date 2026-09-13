// 파일 위치: src/domains/memo/page/components/PageMemoSidebar.jsx
import React from 'react';
import { FolderIcon, FolderPlusIcon, TrashIcon } from '../../shared/components/MemoIcons';
import PageMemoTreeRenderer from './PageMemoTreeRenderer';
import { usePageMemoTree } from '../hooks/usePageMemoTree';

const PageMemoSidebar = ({
  styles,
  isTreeOpen,
  setIsTreeOpen,
  folders,
  currentFolder,
  setCurrentFolder,
  memos,
  handleAddFolder,
  handleEditFolder,
  handleDeleteFolder
}) => {
  const treeHooks = usePageMemoTree({ folders, memos });

  return (
    <div className={`${styles.memoLeftTree} ${!isTreeOpen ? styles.closed : ''}`}>
      <div className={styles.treeContent}>
        
        <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary-color)', paddingBottom: '10px', borderBottom: '2px solid var(--border-color)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FolderIcon /> 메모 폴더</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {/* "현재 폴더 수정" 버튼은 제거함 — 트리에서 폴더를 선택하면 나오는 "이름 변경" 버튼과
                  완전히 같은 handleEditFolder(currentFolder) 호출이라 순수 중복이었다. */}
              <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', fontSize: '11px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={() => handleAddFolder('')} title="최상위 폴더 추가"><FolderPlusIcon /></button>
              <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', fontSize: '11px', background: 'var(--surface-color)', border: '1px solid #e53e3e', color: '#e53e3e' }} onClick={() => handleDeleteFolder(currentFolder)} title="삭제"><TrashIcon /></button>
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <PageMemoTreeRenderer
            node={treeHooks.treeData}
            treeHooks={treeHooks}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
            handleAddFolder={handleAddFolder}
            handleEditFolder={handleEditFolder}
            handleDeleteFolder={handleDeleteFolder}
            memos={memos}
          />
        </div>

      </div>

      <div className={styles.treeHandle} onClick={() => setIsTreeOpen(!isTreeOpen)}>
        <div className="dash" style={{ width: '14px', height: '3px', backgroundColor: 'currentColor', borderRadius: '2px' }}></div>
        <div className="dash" style={{ width: '14px', height: '3px', backgroundColor: 'currentColor', borderRadius: '2px' }}></div>
        <div className="dash" style={{ width: '14px', height: '3px', backgroundColor: 'currentColor', borderRadius: '2px' }}></div>
      </div>
    </div>
  );
};

export default PageMemoSidebar;
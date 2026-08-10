// 파일 위치: src/domains/memo/page/components/PageMemoSidebar.jsx
// 기능 요약: 워크스페이스 좌측에 밀착하여 폴더 제어 및 메모 목록 요약을 렌더링하는 슬라이드형 UI 사이드바
// 버전: v1.0.0

import React from 'react';

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
  console.log("[PageMemoSidebar] 좌측 폴더 트리 UI 렌더링");

  return (
    <div className={`${styles.memoLeftTree} ${!isTreeOpen ? styles.closed : ''}`}>
      <div className={styles.treeContent}>
        
        <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary-color)', paddingBottom: '10px', borderBottom: '2px solid var(--border-color)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📂 메모 폴더</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="wiki-btn" style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={handleAddFolder} title="추가">➕</button>
              <button className="wiki-btn" style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={handleEditFolder} title="수정">✏️</button>
              <button className="wiki-btn" style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--surface-color)', border: '1px solid #e53e3e', color: '#e53e3e' }} onClick={handleDeleteFolder} title="삭제">✖</button>
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {folders.map(f => (
            <div key={f} className={`${styles.folderItem} ${currentFolder === f ? styles.active : ''}`} onClick={() => setCurrentFolder(f)}>
              <span>{f === '전체 메모' ? '📁' : '📂'} {f}</span>
              <span style={{ fontSize: '11px', opacity: 0.6 }}>
                {f === '전체 메모' ? memos.length : memos.filter(m => m.folder === f).length}
              </span>
            </div>
          ))}
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
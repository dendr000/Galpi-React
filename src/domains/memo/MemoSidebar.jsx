// 파일 위치: src/domains/memo/MemoSidebar.jsx
// 기능 요약: 스마트 폴더, 재귀 폴더 트리, 태그 탐색기 등 분리된 서브 모듈들을 조합하여 화면 좌측 탐색기를 렌더링하는 허브 래퍼

import React, { useState } from 'react';
import { useMemoSidebar } from './hooks/useMemoSidebar';
import { FolderPlusIcon, EditIcon, XIcon, FolderIcon, FilePlusIcon } from './components/MemoIcons';
import MemoSmartFolders from './components/MemoSmartFolders';
import MemoTagExplorer from './components/MemoTagExplorer';
import MemoContextMenu from './components/MemoContextMenu';
import MemoTreeRenderer from './components/MemoTreeRenderer';
import MemoItem from './components/MemoItem';

const MemoSidebar = (props) => {
  const sidebarHooks = useMemoSidebar(props);
  const [isExpanded, setIsExpanded] = useState(false);

  // 절대 경로(Shift) 로직 및 알럿 제거, 오직 상대 경로만 조용히 복사
  const handleCopyPath = (e, type, target) => {
    e.stopPropagation();
    const path = type === 'memo' ? `/memo?id=${target}` : `/memo?folder=${encodeURIComponent(target)}`;

    navigator.clipboard.writeText(path).then(() => {
      console.log(`[MemoSidebar] 경로 복사 완료: ${path}`);
    }).catch(err => {
      console.error("[MemoSidebar] 클립보드 복사 실패:", err);
    });
  };

  return (
    <>
      <style>{`
        .galpi-binder-tab { position: absolute; top: 12px; left: 12px; width: 36px; height: 36px; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; color: var(--text-secondary); transition: 0.2s color, 0.2s transform; }
        .galpi-binder-tab:hover { color: var(--primary-color); transform: scale(1.1); }
        .galpi-active-menu-btn { border: 1px solid var(--primary-color) !important; color: var(--primary-color) !important; background: rgba(59, 91, 219, 0.05) !important; }
        .galpi-tree-folder .folder-actions { opacity: 0; pointer-events: none; transition: opacity 0.1s; }
        .galpi-tree-folder:hover .folder-actions { opacity: 1; pointer-events: auto; }
        .galpi-tree-folder .folder-actions button:hover { background: var(--border-color) !important; border-radius: 4px; }
        .memo-editor-header { padding-left: ${isExpanded ? '20px' : '50px'} !important; transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .galpi-sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .galpi-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .galpi-sidebar-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
      `}</style>

      <div style={{ position: 'relative', width: isExpanded ? '300px' : '60px', height: '100%', flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 50, background: 'var(--bg-color)', borderRight: '1px solid var(--border-color)', overflow: 'hidden' }}>
        
        <div className="galpi-binder-tab" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "목록 닫기" : "탐색기 열기"}>
          {isExpanded ? <XIcon size={20} /> : <FolderIcon size={20} />}
        </div>

        <div style={{ width: '300px', height: '100%', opacity: isExpanded ? 1 : 0, pointerEvents: isExpanded ? 'auto' : 'none', transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '15px 15px 15px 50px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="wiki-btn" onClick={() => sidebarHooks.handleAddFolder('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }} title="새 최상위 폴더"><FolderPlusIcon /></button>
              <button className="wiki-btn" onClick={props.handleCreateMemo} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }} title="새 메모"><FilePlusIcon /></button>
            </div>
          </div>

          <div className="galpi-sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <MemoSmartFolders 
              currentFolder={props.currentFolder} 
              setCurrentFolder={props.setCurrentFolder} 
            />

            {(["최근 7일", "미분류"].includes(props.currentFolder) || props.selectedTag) ? (
              <div style={{ padding: '5px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    {props.selectedTag ? `#${props.selectedTag} 검색 결과` : `${props.currentFolder} 결과`} ({sidebarHooks.filteredMemos.length}건)
                  </span>
                  <button 
                    onClick={() => {
                      if (props.selectedTag) props.setSelectedTag(null);
                      else props.setCurrentFolder("기타");
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  >
                    <XIcon size={12} /> 닫기
                  </button>
                </div>
                {sidebarHooks.filteredMemos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>해당하는 메모가 없습니다.</div>
                ) : (
                  <div>
                    {sidebarHooks.filteredMemos.map((m) => (
                      <MemoItem
                        key={String(m.id)}
                        m={m}
                        isActive={String(props.activeMemoId) === String(m.id)}
                        setActiveMemoId={props.setActiveMemoId}
                        handleCopyPath={handleCopyPath}
                        openMoveMenu={sidebarHooks.openMoveMenu}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <MemoTreeRenderer
                  node={sidebarHooks.treeData}
                  sidebarHooks={sidebarHooks}
                  currentFolder={props.currentFolder}
                  setCurrentFolder={props.setCurrentFolder}
                  handleCopyPath={handleCopyPath}
                  activeMemoId={props.activeMemoId}
                  setActiveMemoId={props.setActiveMemoId}
                />
              </div>
            )}
          </div>

          <MemoTagExplorer 
            tagList={sidebarHooks.tagList}
            selectedTag={props.selectedTag}
            setSelectedTag={props.setSelectedTag}
          />
        </div>

        <MemoContextMenu 
          menuData={sidebarHooks.menuData}
          menuRef={sidebarHooks.menuRef}
          memoFolders={props.memoFolders}
          memoData={props.memoData}
          executeMoveMemo={sidebarHooks.executeMoveMemo}
          deleteMemo={sidebarHooks.deleteMemo}
        />
      </div>
    </>
  );
};

export default MemoSidebar;
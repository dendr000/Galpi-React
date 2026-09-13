// 파일 위치: src/domains/memo/fab/components/FabMemoSidebar.jsx
// 기능 요약: 스마트 폴더, 재귀 폴더 트리, 태그 탐색기 등 분리된 서브 모듈들을 조합하여 화면 좌측 탐색기를 렌더링하는 허브 래퍼
import React, { useState, useEffect } from 'react';
import { useFabMemoSidebar } from '../hooks/useFabMemoSidebar';
import { FolderPlusIcon, FilePlusIcon, FolderIcon, XIcon } from '../../shared/components/MemoIcons';
import FabMemoSmartFolders from './FabMemoSmartFolders';
import FabMemoTagExplorer from './FabMemoTagExplorer';
import FabMemoContextMenu from './FabMemoContextMenu';
import FabMemoTreeRenderer from './FabMemoTreeRenderer'; 
import FabMemoItem from './FabMemoItem';

const FabMemoSidebar = (props) => {
  const sidebarHooks = useFabMemoSidebar(props);
  const [isExpanded, setIsExpanded] = useState(false);

  // ★ VSC 방식: 사이드바가 열리거나 활성 메모가 바뀔 때, 해당 메모 위치로 스크롤 자동 이동
  useEffect(() => {
    if (isExpanded && props.activeMemoId) {
      // 트리가 펼쳐지고 DOM이 그려질 시간을 잠시(100ms) 기다린 후 추적
      const timer = setTimeout(() => {
        const activeNode = document.querySelector('.galpi-active-menu-btn');
        if (activeNode) {
          activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, props.activeMemoId]);

  const handleCopyPath = (e, type, target) => {
    e.stopPropagation();
    const path = type === 'memo' ? `/memo?id=${target}` : `/memo?folder=${encodeURIComponent(target)}`;

    navigator.clipboard.writeText(path).catch(err => {
      console.error("[FabMemoSidebar] 클립보드 복사 실패:", err);
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

          <div ref={sidebarHooks.listContainerRef} className="galpi-sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <FabMemoSmartFolders 
              currentFolder={props.currentFolder} 
              setCurrentFolder={props.setCurrentFolder} 
            />

            {(["최근 7일", "미분류"].includes(props.currentFolder) || props.selectedTag) ? (
              <div style={{ padding: '5px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '10px', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 'bold', flexShrink: 0 }}>
                    {props.selectedTag ? `#${props.selectedTag} 검색 결과` : `${props.currentFolder} 결과`} ({sidebarHooks.filteredMemos.length}건)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <select
                      value={sidebarHooks.currentSort}
                      onChange={sidebarHooks.handleSortChange}
                      title="정렬 기준"
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '10.5px', fontWeight: 'bold', padding: '2px 4px', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="name">이름순</option>
                      <option value="date">최신순</option>
                    </select>
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
                </div>
                {sidebarHooks.filteredMemos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>해당하는 메모가 없습니다.</div>
                ) : (
                  <div>
                    {sidebarHooks.filteredMemos.map((m) => (
                      <FabMemoItem
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
                <FabMemoTreeRenderer
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

          <FabMemoTagExplorer 
            tagList={sidebarHooks.tagList}
            selectedTag={props.selectedTag}
            setSelectedTag={props.setSelectedTag}
          />
        </div>

        <FabMemoContextMenu 
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

export default FabMemoSidebar;
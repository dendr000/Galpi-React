import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMemoSidebar } from './hooks/useMemoSidebar';
import { 
  FolderPlusIcon, EditIcon, XIcon, FileTextIcon, 
  MoreVerticalIcon, FolderIcon 
} from './components/MemoIcons';
import MemoSmartFolders from './components/MemoSmartFolders';
import MemoTagExplorer from './components/MemoTagExplorer';
import MemoContextMenu from './components/MemoContextMenu';

const MemoSidebar = (props) => {
  const sidebarHooks = useMemoSidebar(props);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTagExplorerOpen, setIsTagExplorerOpen] = useState(false); 

  const renderTreeNodes = (node) => {
    if (node.depth === -1) {
      return (
        <div style={{ paddingBottom: '10px' }}>
          {Object.values(node.children).map(renderTreeNodes)}
          {node.memos.map((m, idx) => renderMemoItem(m, idx))}
        </div>
      );
    }

    const isFolderExpanded = sidebarHooks.expandedFolders[node.path];

    return (
      <div key={node.path} style={{ marginLeft: node.depth === 0 ? 0 : 12 }}>
        <div 
          className="galpi-tree-folder"
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '6px 8px', borderRadius: '4px', cursor: 'pointer',
            background: props.currentFolder === node.path ? 'rgba(59,91,219,0.08)' : 'transparent',
            color: props.currentFolder === node.path ? 'var(--primary-color)' : 'var(--text-primary)',
            fontWeight: 'bold', fontSize: '13px', transition: 'background 0.2s'
          }}
          onClick={() => {
            sidebarHooks.toggleFolder(node.path);
            props.setCurrentFolder(node.path);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', opacity: 0.7 }}>
              {isFolderExpanded ? '▼' : '▶'}
            </span>
            <FolderIcon />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.name}
            </span>
          </div>

          <div className="folder-actions" style={{ display: 'flex', gap: '4px' }}>
            <button className="wiki-btn" onClick={(e) => { e.stopPropagation(); sidebarHooks.handleAddFolder(node.path); }} style={{ background:'transparent', border:'none', color:'var(--text-secondary)', padding:'2px', display:'flex' }} title="하위 폴더 추가"><FolderPlusIcon /></button>
            <button className="wiki-btn" onClick={(e) => { e.stopPropagation(); sidebarHooks.handleEditFolder(node.path); }} style={{ background:'transparent', border:'none', color:'var(--text-secondary)', padding:'2px', display:'flex' }} title="이름 변경"><EditIcon /></button>
            <button className="wiki-btn" onClick={(e) => { e.stopPropagation(); sidebarHooks.handleDeleteFolder(node.path); }} style={{ background:'transparent', border:'none', color:'#e53e3e', padding:'2px', display:'flex' }} title="삭제"><XIcon size={12} /></button>
          </div>
        </div>

        {isFolderExpanded && (
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '8px', paddingLeft: '4px', marginTop: '2px' }}>
            {Object.values(node.children).map(renderTreeNodes)}
            <Droppable droppableId={node.path}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '5px' }}>
                  {node.memos.map((m, idx) => renderMemoItem(m, idx))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </div>
    );
  };

  const renderMemoItem = (m, index) => {
    const isActive = String(props.activeMemoId) === String(m.id);
    
    return (
      <Draggable key={String(m.id)} draggableId={String(m.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
            onClick={() => props.setActiveMemoId(m.id)}
            className={isActive ? 'galpi-active-menu-btn' : ''}
            style={{
              ...provided.draggableProps.style,
              padding: '6px 10px 6px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: snapshot.isDragging ? 'var(--table-bg-alt)' : 'transparent',
              opacity: snapshot.isDragging ? 0.8 : 1, transition: 'background 0.2s', marginTop: '2px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <FileTextIcon />
              <span style={{ fontSize: '13px', color: isActive ? '#e53e3e' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.title || '제목 없음'}
              </span>
            </div>
            <button onClick={(e) => sidebarHooks.openMoveMenu(e, m.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoreVerticalIcon /></button>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <>
      <style>{`
        .galpi-binder-tab { position: absolute; top: 12px; left: 12px; width: 36px; height: 36px; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; color: var(--text-secondary); transition: 0.2s color, 0.2s transform; }
        .galpi-binder-tab:hover { color: var(--primary-color); transform: scale(1.1); }
        .galpi-active-menu-btn { border: 1px solid #e53e3e !important; color: #e53e3e !important; background: rgba(229, 62, 62, 0.05) !important; }
        .galpi-tree-folder .folder-actions { opacity: 0; pointer-events: none; transition: opacity 0.1s; }
        .galpi-tree-folder:hover .folder-actions { opacity: 1; pointer-events: auto; }
        .galpi-tree-folder .folder-actions button:hover { background: var(--border-color) !important; border-radius: 4px; }
        
        .galpi-sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .galpi-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .galpi-sidebar-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
      `}</style>

      <div style={{ position: 'relative', width: isExpanded ? '300px' : '60px', height: '100%', flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 50, background: 'var(--bg-color)', borderRight: '1px solid var(--border-color)', overflow: 'hidden' }}>
        
        <div className="galpi-binder-tab" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "목록 닫기" : "탐색기 열기"}>
          {isExpanded ? <XIcon size={20} /> : <FolderIcon size={20} />}
        </div>

        <div style={{ width: '300px', height: '100%', opacity: isExpanded ? 1 : 0, pointerEvents: isExpanded ? 'auto' : 'none', transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '15px 15px 15px 60px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="wiki-btn" onClick={() => sidebarHooks.handleAddFolder('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }} title="새 최상위 폴더"><FolderPlusIcon /></button>
              <button className="wiki-btn" onClick={props.handleCreateMemo} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }} title="새 메모"><EditIcon /></button>
            </div>
          </div>

          <div className="galpi-sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <MemoSmartFolders 
              currentFolder={props.currentFolder} 
              setCurrentFolder={props.setCurrentFolder} 
            />

            {(["최근 7일", "잠긴 메모", "미분류"].includes(props.currentFolder) || props.selectedTag) ? (
              <div style={{ padding: '5px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    {props.selectedTag ? `#${props.selectedTag} 검색 결과` : `${props.currentFolder} 결과`} ({sidebarHooks.filteredMemos.length}건)
                  </span>
                  {/* ★ 트리뷰로 복귀하는 닫기 버튼 추가 */}
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
                  <DragDropContext onDragEnd={sidebarHooks.handleDragEnd}>
                    <Droppable droppableId="filtered-list-droppable">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {sidebarHooks.filteredMemos.map((m, idx) => renderMemoItem(m, idx))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            ) : (
              <DragDropContext onDragEnd={sidebarHooks.handleDragEnd}>
                {renderTreeNodes(sidebarHooks.treeData)}
              </DragDropContext>
            )}
          </div>

          <MemoTagExplorer 
            isTagExplorerOpen={isTagExplorerOpen}
            setIsTagExplorerOpen={setIsTagExplorerOpen}
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
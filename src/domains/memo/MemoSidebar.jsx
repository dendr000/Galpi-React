// 파일 위치: src/domains/memo/MemoSidebar.jsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMemoSidebar } from './hooks/useMemoSidebar';
import { 
  FolderPlusIcon, EditIcon, XIcon, FileTextIcon, 
  MoreVerticalIcon, FolderIcon, TrashIcon, TagIcon 
} from './components/MemoIcons'; 

const MemoSidebar = (props) => {
  const sidebarHooks = useMemoSidebar(props);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTagExplorerOpen, setIsTagExplorerOpen] = useState(false); // ★ 태그 탐색기 토글 상태

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
          {isExpanded ? (
            <XIcon size={20} />
          ) : (
            <FolderIcon size={20} />
          )}
        </div>

        <div style={{ width: '300px', height: '100%', opacity: isExpanded ? 1 : 0, pointerEvents: isExpanded ? 'auto' : 'none', transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column' }}>
          
          {/* ★ '탐색기 (DB)' 텍스트 삭제 후 우측 정렬만 깔끔하게 유지 */}
          <div style={{ padding: '15px 15px 15px 60px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="wiki-btn" onClick={() => sidebarHooks.handleAddFolder('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }} title="새 최상위 폴더"><FolderPlusIcon /></button>
              <button className="wiki-btn" onClick={props.handleCreateMemo} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }} title="새 메모"><EditIcon /></button>
            </div>
          </div>

          <div className="galpi-sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <DragDropContext onDragEnd={sidebarHooks.handleDragEnd}>
              {renderTreeNodes(sidebarHooks.treeData)}
            </DragDropContext>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', background: 'var(--table-bg-alt)', flexShrink: 0 }}>
            <div 
              onClick={() => setIsTagExplorerOpen(!isTagExplorerOpen)}
              // ★ 상하 패딩을 12px -> 16px로 4px씩 늘려 우측 태그 바와 높이 및 경계선을 완벽하게 일치시킵니다.
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 15px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                <TagIcon /> 태그 탐색기
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', transform: isTagExplorerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </div>
            
            <div className="galpi-sidebar-scroll" style={{ 
              display: 'flex', flexWrap: 'wrap', gap: '6px', 
              maxHeight: isTagExplorerOpen ? '150px' : '0', 
              padding: isTagExplorerOpen ? '0 15px 15px 15px' : '0 15px',
              opacity: isTagExplorerOpen ? 1 : 0,
              overflowY: 'auto', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}>
              {sidebarHooks.tagList.length === 0 ? (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>등록된 태그가 없습니다.</span>
              ) : (
                sidebarHooks.tagList.map(t => (
                  <button
                    key={t.name}
                    onClick={() => props.setSelectedTag(props.selectedTag === t.name ? null : t.name)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                      border: props.selectedTag === t.name ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                      background: props.selectedTag === t.name ? 'var(--primary-color)' : 'var(--bg-color)',
                      color: props.selectedTag === t.name ? '#fff' : 'var(--text-primary)',
                      transition: '0.2s'
                    }}
                  >
                    #{t.name} <span style={{ opacity: 0.7, fontSize: '10px' }}>({t.count})</span>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

        {/* 컨텍스트 메뉴 */}
        {sidebarHooks.menuData.isOpen && (
          <div ref={sidebarHooks.menuRef} style={{ position: 'fixed', top: sidebarHooks.menuData.y, left: sidebarHooks.menuData.x, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 99999, display: 'flex', flexDirection: 'column', minWidth: '180px', maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'default' }}><FolderIcon /> 이동할 폴더 선택</div>
            {props.memoFolders.sort().filter(f => f !== "기타").map(f => {
              const targetMemo = props.memoData.find(m => String(m.id) === String(sidebarHooks.menuData.memoId));
              const isCurrent = targetMemo?.folder === f;
              const depth = f.split('/').length - 1;
              const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(depth);
              const displayName = f.split('/').pop();

              return (
                <div key={f} className="memo-move-item" onClick={() => !isCurrent && sidebarHooks.executeMoveMemo(f)} style={{ opacity: isCurrent ? 0.4 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseOver={(e) => { if(!isCurrent) { e.currentTarget.style.background = 'var(--table-bg-alt)'; e.currentTarget.style.color = 'var(--primary-color)'; } }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                  <span>{indent}</span><FolderIcon /> {displayName} {isCurrent ? '(현재)' : ''}
                </div>
              );
            })}
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0', flexShrink: 0 }}></div>
            <div className="memo-move-item" onClick={sidebarHooks.deleteMemo} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e53e3e', fontWeight: 900, padding: '8px 12px', fontSize: '12px', cursor: 'pointer', transition: '0.2s', flexShrink: 0 }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--table-bg-alt)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}><TrashIcon /> 영구 삭제</div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemoSidebar;
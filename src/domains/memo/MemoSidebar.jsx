// 파일 위치: src/components/layout/fab/memo/MemoSidebar.jsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMemoSidebar } from './useMemoSidebar';

const MemoSidebar = (props) => {
  // ★ 비즈니스 로직과 상태 관리를 전담하는 커스텀 훅 인젝션
  const sidebarHooks = useMemoSidebar(props);

  return (
    <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', flexShrink: 0 }}>
      <div style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <select 
            value={props.currentFolder} onChange={e => props.setCurrentFolder(e.target.value)} 
            style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--primary-color)', fontWeight: 'bold', outline: 'none' }}
          >
            {props.memoFolders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button className="wiki-btn" onClick={sidebarHooks.handleAddFolder} style={{ padding: '6px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} title="폴더 추가">➕</button>
          <button className="wiki-btn" onClick={sidebarHooks.handleEditFolder} style={{ padding: '6px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} title="폴더 수정">✏️</button>
          <button className="wiki-btn" onClick={sidebarHooks.handleDeleteFolder} style={{ padding: '6px', background: 'var(--surface-color)', border: '1px solid #e53e3e', color: '#e53e3e' }} title="폴더 삭제">✖</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>📄 {sidebarHooks.filteredMemos.length}개의 메모</span>
          <select value={sidebarHooks.currentSort} onChange={sidebarHooks.handleSortChange} style={{ fontSize: '12px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }}>
            <option value="name">이름순 정렬</option>
            <option value="date">최신 수정순</option>
            <option value="custom">사용자 지정순</option>
          </select>
        </div>
      </div>

      <div ref={sidebarHooks.listContainerRef} style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {sidebarHooks.filteredMemos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>메모가 없습니다.</div>
        ) : (
          <DragDropContext onDragEnd={sidebarHooks.handleDragEnd}>
            <Droppable droppableId="memo-list-droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sidebarHooks.filteredMemos.map((m, index) => {
                    const isActive = String(props.activeMemoId) === String(m.id);
                    const dateStr = new Date(m.updatedAt).toLocaleDateString('ko-KR');
                    
                    return (
                      <Draggable key={String(m.id)} draggableId={String(m.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            onClick={() => props.setActiveMemoId(m.id)}
                            style={{
                              ...provided.draggableProps.style,
                              padding: '12px 15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                              background: snapshot.isDragging ? 'var(--table-bg-alt)' : (isActive ? 'rgba(59,91,219,0.08)' : 'transparent'),
                              borderLeft: `3px solid ${isActive ? 'var(--primary-color)' : 'transparent'}`,
                              opacity: snapshot.isDragging ? 0.8 : 1, transition: 'background 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.title || '제목 없음'}</h4>
                              <button onClick={(e) => sidebarHooks.openMoveMenu(e, m.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 5px', fontWeight: 'bold', fontSize: '14px' }}>⋮</button>
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>{dateStr} | 📂 {m.folder}</p>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <div style={{ padding: '10px' }}>
        <button onClick={props.handleCreateMemo} className="wiki-btn" style={{ width: '100%', padding: '10px', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', borderRadius: '6px', border: 'none' }}>+ 새 메모 작성</button>
      </div>

      {sidebarHooks.menuData.isOpen && (
        <div ref={sidebarHooks.menuRef} style={{ position: 'fixed', top: sidebarHooks.menuData.y, left: sidebarHooks.menuData.x, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 99999, display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
          <div style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'default' }}>📂 이동할 폴더 선택</div>
          {props.memoFolders.filter(f => f !== "전체 메모").map(f => {
            const targetMemo = props.memoData.find(m => String(m.id) === String(sidebarHooks.menuData.memoId));
            const isCurrent = targetMemo?.folder === f;
            return (
              <div key={f} className="memo-move-item" onClick={() => !isCurrent && sidebarHooks.executeMoveMemo(f)} style={{ opacity: isCurrent ? 0.4 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer' }}>
                📁 {f} {isCurrent ? '(현재)' : ''}
              </div>
            );
          })}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
          <div className="memo-move-item" onClick={sidebarHooks.deleteMemo} style={{ color: '#e53e3e', fontWeight: 900 }}>🗑️ 영구 삭제</div>
        </div>
      )}
    </div>
  );
};

export default MemoSidebar;
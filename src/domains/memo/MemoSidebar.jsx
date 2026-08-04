// 파일 위치: src/components/layout/fab/memo/MemoSidebar.jsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMemoSidebar } from './hooks/useMemoSidebar';

const MemoSidebar = (props) => {
  const sidebarHooks = useMemoSidebar(props);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <style>{`
        /* 🌟 배경과 테두리를 걷어낸 순수 SVG 탭 버튼 */
        .galpi-binder-tab {
          position: absolute;
          top: 12px;  
          left: 12px;
          width: 36px;
          height: 36px;
          background: transparent; 
          border: none;            
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          color: var(--text-secondary); 
          transition: 0.2s color, 0.2s transform;
        }

        .galpi-binder-tab:hover {
          color: var(--primary-color);
          transform: scale(1.1); 
        }

        /* 활성화된 버튼에 빨간색 아웃라인을 주는 CSS 클래스 */
        .galpi-active-menu-btn {
          border: 2px solid #e53e3e !important;
          color: #e53e3e !important;
          background: rgba(229, 62, 62, 0.05) !important;
        }
      `}</style>

      {/* ★ 핵심 해결책: 닫혔을 때 너비를 0px이 아닌 60px로 주어, 에디터를 자연스럽게 오른쪽으로 밀어냅니다. */}
      <div style={{
        position: 'relative',
        width: isExpanded ? '300px' : '60px',
        height: '100%',
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        background: 'var(--bg-color)',
        borderRight: '1px solid var(--border-color)', // 부모에 테두리를 두어 닫혔을 때도 깔끔한 구분선 유지
        overflow: 'hidden' // 300px 내용물이 60px 밖으로 튀어나가는 것을 완벽히 차단
      }}>
        
        {/* 🌟 60px 안전 구역 안에 안착된 탭 버튼 */}
        <div className="galpi-binder-tab" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "목록 닫기" : "메모 목록 열기"}>
          {isExpanded ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line><line x1="12" y1="11" x2="12" y2="17"></line></svg>
          )}
        </div>

        {/* 🌟 내부 컨텐츠 컨테이너 (너비를 300px로 고정하여 글자 줄바꿈 및 찌그러짐 방지) */}
        <div style={{
          width: '300px', 
          height: '100%',
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none',
          transition: 'opacity 0.2s',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* 탭 버튼 공간(60px)을 피해 패딩을 60px로 부여 */}
          <div style={{ padding: '15px 15px 15px 60px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                className={isActive ? 'galpi-active-menu-btn' : ''}
                                style={{
                                  ...provided.draggableProps.style,
                                  padding: '12px 15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                                  background: snapshot.isDragging ? 'var(--table-bg-alt)' : 'transparent',
                                  borderLeft: !isActive ? '3px solid transparent' : undefined,
                                  opacity: snapshot.isDragging ? 0.8 : 1, transition: 'background 0.2s'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                  <h4 style={{ margin: 0, fontSize: '14px', color: isActive ? '#e53e3e' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.title || '제목 없음'}</h4>
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
        </div>

        {/* 🌟 잘림 방지를 위해 마스킹 컨테이너 밖으로 빼낸 컨텍스트 메뉴 */}
        {sidebarHooks.menuData.isOpen && (
          <div ref={sidebarHooks.menuRef} style={{ position: 'fixed', top: sidebarHooks.menuData.y, left: sidebarHooks.menuData.x, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 99999, display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <div style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'default' }}>📂 이동할 폴더 선택</div>
            {props.memoFolders.filter(f => f !== "전체 메모").map(f => {
              const targetMemo = props.memoData.find(m => String(m.id) === String(sidebarHooks.menuData.memoId));
              const isCurrent = targetMemo?.folder === f;
              return (
                <div key={f} className="memo-move-item" onClick={() => !isCurrent && sidebarHooks.executeMoveMemo(f)} style={{ opacity: isCurrent ? 0.4 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', transition: '0.2s' }} onMouseOver={(e) => { if(!isCurrent) e.currentTarget.style.background = 'var(--table-bg-alt)'; e.currentTarget.style.color = 'var(--primary-color)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                  📁 {f} {isCurrent ? '(현재)' : ''}
                </div>
              );
            })}
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
            <div className="memo-move-item" onClick={sidebarHooks.deleteMemo} style={{ color: '#e53e3e', fontWeight: 900, padding: '8px 12px', fontSize: '12px', cursor: 'pointer', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--table-bg-alt)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🗑️ 영구 삭제</div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemoSidebar;
// 파일 위치: src/components/layout/fab/memo/MemoSidebar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../api/axiosCore';

const MemoSidebar = ({ 
  memoData, setMemoData, memoFolders, setMemoFolders, currentFolder, setCurrentFolder,
  activeMemoId, setActiveMemoId, sortMap, setSortMap, handleCreateMemo 
}) => {
  const [menuData, setMenuData] = useState({ isOpen: false, x: 0, y: 0, memoId: null });
  const listContainerRef = useRef(null);
  const menuRef = useRef(null);

  // ★ 1. 컨텍스트 메뉴 닫힘 버그 완벽 해결 (Click Outside & ESC Key)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuData.isOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
      }
    };
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && menuData.isOpen) {
        setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    const scrollArea = listContainerRef.current;
    const handleScroll = () => setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
    if (scrollArea) scrollArea.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      if (scrollArea) scrollArea.removeEventListener('scroll', handleScroll);
    };
  }, [menuData.isOpen]);

  const handleAddFolder = () => {
    const name = prompt("새로운 폴더 이름을 입력하세요:");
    if (name && name.trim() && !memoFolders.includes(name.trim())) {
      const newFolders = [...memoFolders, name.trim()];
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      setCurrentFolder(name.trim());
    }
  };

  const handleEditFolder = async () => {
    if (["전체 메모", "설정 아이디어", "기타"].includes(currentFolder)) {
      return alert("기본 폴더는 이름을 수정할 수 없습니다.");
    }
    const newName = prompt("수정할 폴더 이름을 입력하세요:", currentFolder);
    if (newName && newName.trim() && newName.trim() !== currentFolder) {
      const finalName = newName.trim();
      if (memoFolders.includes(finalName)) return alert("이미 존재하는 폴더명입니다.");
      
      const newFolders = memoFolders.map(f => f === currentFolder ? finalName : f);
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memoData.map(m => m.folder === currentFolder ? { ...m, folder: finalName, updatedAt: Date.now() } : m);
      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder(finalName);

      const affectedMemos = newData.filter(m => m.folder === finalName);
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("폴더 일괄 동기화 통신 거부", e));
    }
  };

  const handleDeleteFolder = async () => {
    if (["전체 메모", "설정 아이디어", "기타"].includes(currentFolder)) {
      return alert("기본 폴더는 삭제할 수 없습니다.");
    }
    if (window.confirm(`'${currentFolder}' 폴더를 삭제하시겠습니까?\n(내부에 있던 메모는 모두 '기타' 폴더로 자동 이동되며 DB에 반영됩니다)`)) {
      const newFolders = memoFolders.filter(f => f !== currentFolder);
      setMemoFolders(newFolders);
      localStorage.setItem('galpi-memo-folders', JSON.stringify(newFolders));
      
      const newData = memoData.map(m => m.folder === currentFolder ? { ...m, folder: "기타", updatedAt: Date.now() } : m);
      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));
      setCurrentFolder("전체 메모");

      const affectedMemos = newData.filter(m => m.folder === "기타");
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("폴더 삭제 후 이동 동기화 실패", e));
    }
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const newSortMap = { ...sortMap, [currentFolder]: val };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  const currentSort = sortMap[currentFolder] || 'date';
  let filteredMemos = currentFolder !== "전체 메모" ? memoData.filter(m => m.folder === currentFolder) : [...memoData];

  filteredMemos.sort((a, b) => {
    if (currentSort === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
    if (currentSort === 'custom') return (a.sortOrder !== undefined ? a.sortOrder : 9999) - (b.sortOrder !== undefined ? b.sortOrder : 9999);
    return b.updatedAt - a.updatedAt;
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(filteredMemos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const newData = memoData.map(m => {
      const foundIdx = items.findIndex(item => String(item.id) === String(m.id));
      if (foundIdx !== -1) return { ...m, sortOrder: foundIdx };
      return m;
    });

    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));
    
    const newSortMap = { ...sortMap, [currentFolder]: 'custom' };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  const openMoveMenu = (e, id) => {
    e.stopPropagation();
    let posX = e.clientX; let posY = e.clientY;
    const menuWidth = 150; const menuHeight = 250;
    if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
    if (posY + menuHeight > window.innerHeight) posY = window.innerHeight - menuHeight - 10;
    setMenuData({ isOpen: true, x: posX, y: posY, memoId: id });
  };

  const executeMoveMemo = async (folderName) => {
    const targetMemo = memoData.find(m => String(m.id) === String(menuData.memoId));
    if (!targetMemo) return;

    const updatedMemo = { ...targetMemo, folder: folderName, updatedAt: Date.now() };
    const newData = memoData.map(m => String(m.id) === String(menuData.memoId) ? updatedMemo : m);
    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));

    try {
      const isEdit = !String(targetMemo.id).startsWith("local_") && String(targetMemo.id).length < 13;
      await api[isEdit ? 'put' : 'post'](`/api/memos${isEdit ? `/${targetMemo.id}` : ''}`, updatedMemo);
    } catch(e) {}
    setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
  };

  const deleteMemo = async () => {
    if (!window.confirm("정말 이 메모를 영구 삭제하시겠습니까?")) return;
    const newData = memoData.filter(m => String(m.id) !== String(menuData.memoId));
    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));

    try {
      const isEdit = !String(menuData.memoId).startsWith("local_") && String(menuData.memoId).length < 13;
      if (isEdit) await api.delete(`/api/memos/${menuData.memoId}`);
    } catch(e) {}
    
    if (String(activeMemoId) === String(menuData.memoId)) {
      setActiveMemoId(newData.length > 0 ? newData[0].id : null);
    }
    setMenuData({ isOpen: false, x: 0, y: 0, memoId: null });
  };

  return (
    <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', flexShrink: 0 }}>
      <div style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <select 
            value={currentFolder} onChange={e => setCurrentFolder(e.target.value)} 
            style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--primary-color)', fontWeight: 'bold', outline: 'none' }}
          >
            {memoFolders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button className="wiki-btn" onClick={handleAddFolder} style={{ padding: '6px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} title="폴더 추가">➕</button>
          <button className="wiki-btn" onClick={handleEditFolder} style={{ padding: '6px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} title="폴더 수정">✏️</button>
          <button className="wiki-btn" onClick={handleDeleteFolder} style={{ padding: '6px', background: 'var(--surface-color)', border: '1px solid #e53e3e', color: '#e53e3e' }} title="폴더 삭제">✖</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>📄 {filteredMemos.length}개의 메모</span>
          <select value={currentSort} onChange={handleSortChange} style={{ fontSize: '12px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }}>
            <option value="date">최신 수정순</option>
            <option value="name">이름순 정렬</option>
            <option value="custom">사용자 지정순</option>
          </select>
        </div>
      </div>

      <div ref={listContainerRef} style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {filteredMemos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>메모가 없습니다.</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="memo-list-droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredMemos.map((m, index) => {
                    const isActive = String(activeMemoId) === String(m.id);
                    const dateStr = new Date(m.updatedAt).toLocaleDateString('ko-KR');
                    
                    return (
                      <Draggable key={String(m.id)} draggableId={String(m.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            onClick={() => setActiveMemoId(m.id)}
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
                              <button onClick={(e) => openMoveMenu(e, m.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 5px', fontWeight: 'bold', fontSize: '14px' }}>⋮</button>
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
        <button onClick={handleCreateMemo} className="wiki-btn" style={{ width: '100%', padding: '10px', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', borderRadius: '6px', border: 'none' }}>+ 새 메모 작성</button>
      </div>

      {menuData.isOpen && (
        <div ref={menuRef} style={{ position: 'fixed', top: menuData.y, left: menuData.x, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 99999, display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
          <div style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'default' }}>📂 이동할 폴더 선택</div>
          {memoFolders.filter(f => f !== "전체 메모").map(f => {
            const targetMemo = memoData.find(m => String(m.id) === String(menuData.memoId));
            const isCurrent = targetMemo?.folder === f;
            return (
              <div key={f} className="memo-move-item" onClick={() => !isCurrent && executeMoveMemo(f)} style={{ opacity: isCurrent ? 0.4 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer' }}>
                📁 {f} {isCurrent ? '(현재)' : ''}
              </div>
            );
          })}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
          <div className="memo-move-item" onClick={deleteMemo} style={{ color: '#e53e3e', fontWeight: 900 }}>🗑️ 영구 삭제</div>
        </div>
      )}
    </div>
  );
};

export default MemoSidebar;
// 파일 위치: src/pages/MemoWorkspace/MemoWorkspacePage.jsx
// 기능 요약: 데이터 상태 훅(useMemoWorkspaceData)과 분리된 UI(Tree, Modal, Canvas)를 조립하여 최종 렌더링하는 워크스페이스 컨트롤러 컴포넌트
// 버전: v2.1.0

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from './MemoWorkspace.module.css';
import MemoLeftTree from './MemoLeftTree';
import WorkspaceEditorModal from './WorkspaceEditorModal';
import { useMemoWorkspaceData } from './useMemoWorkspaceData';

const MemoWorkspacePage = () => {
  const navigate = useNavigate();
  console.log("[MemoWorkspacePage] 메모 워크스페이스 컨트롤러 렌더링 개시");

  const {
    memos, setMemos, folders, currentFolder, setCurrentFolder,
    filteredMemos, handleAddFolder, handleEditFolder, handleDeleteFolder
  } = useMemoWorkspaceData();

  const [currentView, setCurrentView] = useState("list");
  const [isTreeOpen, setIsTreeOpen] = useState(true);
  
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', folder: '기타' });

  // ----------------------------------------------------
  // 고도화된 캔버스 물리 엔진 상태 (줌, 패닝, 포인터 드래그, Z-index)
  // ----------------------------------------------------
  const boardRef = useRef(null);
  const [pan, setPan] = useState({ x: -1500, y: -1500 });
  const [zoom, setZoom] = useState(1);
  const [topMemoId, setTopMemoId] = useState(null);

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const draggingNodeRef = useRef(null);
  const nodeStartPosRef = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });

  const handleOpenEditor = (memo) => {
    console.log(`[MemoWorkspacePage] 에디터 모달 개방 요청. 대상 메모: ${memo ? memo.title : '신규 생성'}`);
    if (memo) {
      setActiveMemoId(memo.id);
      setTopMemoId(memo.id);
      setEditData({ title: memo.title, folder: memo.folder || '기타' });
    } else {
      setActiveMemoId(null);
      setEditData({ title: '', folder: currentFolder === '전체 메모' ? '기타' : currentFolder });
    }
    setIsEditorOpen(true);
  };

  const handleWheel = (e) => {
    if (currentView !== 'canvas') return;
    if (e.target.closest(`.${styles.canvasNode}`)) return; 
    
    console.log(`[MemoWorkspacePage] 캔버스 줌 휠 이벤트 감지`);
    const zoomSensitivity = 0.001;
    setZoom(prevZoom => {
      let newZoom = prevZoom - e.deltaY * zoomSensitivity;
      if (newZoom < 0.3) newZoom = 0.3;
      if (newZoom > 2.5) newZoom = 2.5;
      return newZoom;
    });
  };

  const handlePointerDown = (e, memoId = null) => {
    if (e.button !== 0) return; 

    if (memoId) {
      console.log(`[MemoWorkspacePage] 메모 노드 드래그 시작: ID ${memoId}`);
      e.stopPropagation();
      setTopMemoId(memoId);
      
      const targetMemo = memos.find(m => m.id === memoId);
      if (!targetMemo) return;

      draggingNodeRef.current = memoId;
      nodeStartPosRef.current = { x: targetMemo.canvasX ?? 2500, y: targetMemo.canvasY ?? 2500 };
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      e.target.setPointerCapture(e.pointerId);
    } else {
      console.log(`[MemoWorkspacePage] 캔버스 보드 패닝 시작`);
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      boardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (draggingNodeRef.current) {
      const dx = (e.clientX - pointerStartRef.current.x) / zoom;
      const dy = (e.clientY - pointerStartRef.current.y) / zoom;
      
      const newX = nodeStartPosRef.current.x + dx;
      const newY = nodeStartPosRef.current.y + dy;

      setMemos(prev => prev.map(m => m.id === draggingNodeRef.current ? { ...m, canvasX: newX, canvasY: newY } : m));
    } else if (isPanningRef.current) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
    }
  };

  const handlePointerUp = async (e) => {
    if (draggingNodeRef.current) {
      console.log(`[MemoWorkspacePage] 메모 노드 드래그 종료 및 좌표 DB 저장: ID ${draggingNodeRef.current}`);
      const targetId = draggingNodeRef.current;
      const targetMemo = memos.find(m => m.id === targetId);
      
      e.target.releasePointerCapture(e.pointerId);
      draggingNodeRef.current = null;

      if (targetMemo) {
        try {
          await api.put(`/api/memos/${targetId}`, targetMemo);
        } catch(err) {
          console.error("[MemoWorkspacePage] 메모 좌표 저장 실패", err);
        }
      }
    } else if (isPanningRef.current) {
      console.log(`[MemoWorkspacePage] 캔버스 보드 패닝 종료`);
      isPanningRef.current = false;
      boardRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div style={{ overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <style>{`
        .galpi-outer-select [contenteditable="false"] { opacity: 0.4; filter: grayscale(100%); transition: 0.2s; }
        .galpi-outer-select [contenteditable="false"] *::selection { background: transparent !important; color: inherit !important; }
        .galpi-outer-select [contenteditable="false"] *::-moz-selection { background: transparent !important; color: inherit !important; }
        #memo-edit-content p { margin: 0.3em 0 !important; }
        #memo-edit-content div { margin-top: 0; margin-bottom: 0; }
      `}</style>

      <header className={styles.memoTopBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="wiki-btn" onClick={() => navigate('/')}>🏠 홈으로</button>
          <h1 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)', fontWeight: 900 }}>메모 워크스페이스</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className={styles.viewToggleWrap}>
            <button className={`${styles.viewToggleBtn} ${currentView === 'list' ? styles.active : ''}`} onClick={() => setCurrentView('list')}>🗂️ 리스트 뷰</button>
            <button className={`${styles.viewToggleBtn} ${currentView === 'canvas' ? styles.active : ''}`} onClick={() => setCurrentView('canvas')}>🌌 캔버스 뷰</button>
          </div>
          <button className="wiki-btn" style={{ background: 'var(--primary-color)', color: 'white' }} onClick={() => handleOpenEditor(null)}>+ 새 메모 작성</button>
        </div>
      </header>

      <div className={styles.memoWorkspaceContainer}>
        <MemoLeftTree 
          styles={styles}
          isTreeOpen={isTreeOpen}
          setIsTreeOpen={setIsTreeOpen}
          folders={folders}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          memos={memos}
          handleAddFolder={handleAddFolder}
          handleEditFolder={handleEditFolder}
          handleDeleteFolder={handleDeleteFolder}
        />

        <div className={styles.memoViewport} style={{ paddingLeft: isTreeOpen ? '300px' : '30px' }}>
          
          <div className={`${styles.memoViewPanel} ${currentView === 'list' ? styles.active : ''}`}>
            {filteredMemos.length === 0 ? <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>이 폴더에는 작성된 메모가 없습니다.</div> : (
              <div className={styles.memoGrid}>
                {filteredMemos.map(m => (
                  <div key={m.id} className={styles.memoCard} onClick={() => handleOpenEditor(m)} style={{ borderTop: `4px solid ${m.themeColor || 'var(--primary-color)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className={styles.memoCardTitle}>{m.title || '제목 없음'}</h3>
                    </div>
                    <div className={styles.memoCardPreview}>{m.content ? m.content.replace(/<[^>]*>?/gm, '').trim() : "내용 없음"}</div>
                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📂 {m.folder}</span>
                      <span>⏱️ {new Date(m.updatedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div 
            className={`${styles.memoViewPanel} ${currentView === 'canvas' ? styles.active : ''}`}
            onWheel={handleWheel}
          >
            <div 
              ref={boardRef}
              className={styles.canvasBoard} 
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              onPointerDown={(e) => handlePointerDown(e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {filteredMemos.map(m => (
                <div 
                  key={m.id} 
                  className={styles.canvasNode} 
                  style={{ 
                    left: m.canvasX ?? 2500, 
                    top: m.canvasY ?? 2500, 
                    borderTop: `4px solid ${m.themeColor || 'var(--primary-color)'}`,
                    zIndex: topMemoId === m.id ? 100 : 1,
                    boxShadow: topMemoId === m.id ? '0 10px 30px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, m.id)}
                  onClick={(e) => {
                    console.log(`[MemoWorkspacePage] 메모 노드 클릭 포커싱: ID ${m.id}`);
                    e.stopPropagation();
                    setTopMemoId(m.id);
                  }}
                >
                  <div className={styles.canvasNodeHeader}>{m.title || '제목 없음'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px', pointerEvents: 'none' }}>
                    {m.content ? m.content.replace(/<[^>]*>?/gm, '').trim().substring(0, 60) + '...' : "내용 없음"}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', pointerEvents: 'auto' }}>
                    <button 
                      className="wiki-btn" 
                      style={{ padding: '2px 6px', fontSize: '11px' }} 
                      onPointerDown={(e) => e.stopPropagation()} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditor(m);
                      }}
                    >
                      ✏️ 편집
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <WorkspaceEditorModal 
          memos={memos}
          setMemos={setMemos}
          activeMemoId={activeMemoId}
          editData={editData}
          setEditData={setEditData}
          folders={folders}
          currentFolder={currentFolder}
          setIsEditorOpen={setIsEditorOpen}
        />
      )}
    </div>
  );
};

export default MemoWorkspacePage;
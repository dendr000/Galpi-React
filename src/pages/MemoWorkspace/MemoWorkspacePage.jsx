import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from './MemoWorkspace.module.css';
import MarkdownRenderer from '../../components/macro/MarkdownRenderer';

const MemoWorkspacePage = () => {
  const navigate = useNavigate();
  const [memos, setMemos] = useState([]);
  const [folders, setFolders] = useState(["전체 메모", "설정 아이디어", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");
  const [currentView, setCurrentView] = useState("list");
  const [isTreeOpen, setIsTreeOpen] = useState(true);
  
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '', folder: '기타' });

  // 캔버스 드래그 및 줌 물리 엔진용 Ref
  const boardRef = useRef(null);
  const [pan, setPan] = useState({ x: -1500, y: -1500 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchMemos = async () => {
      try {
        const res = await api.get('/api/memos');
        setMemos(res.data);
        const folderSet = new Set(["전체 메모", "설정 아이디어", "기타"]);
        res.data.forEach(m => { if (m.folder) folderSet.add(m.folder); });
        setFolders(Array.from(folderSet));
      } catch (e) { console.error(e); }
    };
    fetchMemos();
  }, []);

  const handleAddFolder = () => {
    const name = prompt("새로운 폴더 이름을 입력하세요:");
    if (name && name.trim() && !folders.includes(name.trim())) {
      setFolders([...folders, name.trim()]);
      setCurrentFolder(name.trim());
    }
  };

  const handleOpenEditor = (memo) => {
    if (memo) {
      setActiveMemoId(memo.id);
      setEditData({ title: memo.title, content: memo.content || '', folder: memo.folder || '기타' });
    } else {
      setActiveMemoId(null);
      setEditData({ title: '', content: '', folder: currentFolder === '전체 메모' ? '기타' : currentFolder });
    }
    setIsEditorOpen(true);
  };

  const handleSaveMemo = async () => {
    if (!editData.title.trim()) return alert("메모 제목을 입력해주세요.");
    const payload = {
      title: editData.title,
      content: editData.content,
      folder: editData.folder,
      updatedAt: Date.now(),
      canvasX: 2500, canvasY: 2500
    };

    try {
      if (activeMemoId) {
        payload.id = activeMemoId;
        await api.put(`/api/memos/${activeMemoId}`, payload);
        setMemos(prev => prev.map(m => m.id === activeMemoId ? { ...m, ...payload } : m));
      } else {
        const res = await api.post('/api/memos', payload);
        setMemos([res.data, ...memos]);
      }
      setIsEditorOpen(false);
    } catch (e) { alert("메모 저장에 실패했습니다."); }
  };

  const handleDeleteMemo = async () => {
    if (window.confirm("이 메모를 영구 삭제하시겠습니까?")) {
      try {
        await api.delete(`/api/memos/${activeMemoId}`);
        setMemos(prev => prev.filter(m => m.id !== activeMemoId));
        setIsEditorOpen(false);
      } catch (e) { alert("삭제 실패"); }
    }
  };

  const filteredMemos = currentFolder === "전체 메모" ? memos : memos.filter(m => m.folder === currentFolder);

  // --- 캔버스 보드 패닝 이벤트 ---
  const handleBoardMouseDown = (e) => {
    if (e.target.closest(`.${styles.canvasNode}`)) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleBoardMouseMove = (e) => {
    if (!isPanning) return;
    e.preventDefault();
    setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
  };

  const handleBoardMouseUp = () => setIsPanning(false);

  // --- 캔버스 노드 개별 드래그 이벤트 ---
  const handleNodeDragStart = (e, mId) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', mId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeDrop = async (e) => {
    e.preventDefault();
    const mId = e.dataTransfer.getData('text/plain');
    if (!mId) return;

    // 보드의 물리적 좌표에서 현재 패닝 오프셋을 뺀 절대 위치 계산
    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = e.clientX - boardRect.left - pan.x;
    const newY = e.clientY - boardRect.top - pan.y;

    const targetMemo = memos.find(m => String(m.id) === mId);
    if (targetMemo) {
      const updatedMemo = { ...targetMemo, canvasX: newX, canvasY: newY };
      setMemos(prev => prev.map(m => String(m.id) === mId ? updatedMemo : m));
      try { await api.put(`/api/memos/${mId}`, updatedMemo); } catch(e){}
    }
  };

  return (
    <div style={{ overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        
        {/* 좌측 폴더 트리 */}
        <div className={`${styles.memoLeftTree} ${!isTreeOpen ? styles.closed : ''}`}>
          <div className={styles.treeContent}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary-color)', paddingBottom: '10px', borderBottom: '2px solid var(--border-color)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📂 메모 폴더</span>
              <button className="wiki-btn" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={handleAddFolder}>+ 추가</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {folders.map(f => (
                <div key={f} className={`${styles.folderItem} ${currentFolder === f ? styles.active : ''}`} onClick={() => setCurrentFolder(f)}>
                  <span>{f === '전체 메모' ? '📁' : '📂'} {f}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>{f === '전체 메모' ? memos.length : memos.filter(m => m.folder === f).length}</span>
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

        {/* 메인 뷰포트 영역 */}
        <div className={styles.memoViewport} style={{ paddingLeft: isTreeOpen ? '300px' : '30px' }}>
          
          {/* 리스트 뷰 */}
          <div className={`${styles.memoViewPanel} ${currentView === 'list' ? styles.active : ''}`}>
            {filteredMemos.length === 0 ? <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>이 폴더에는 작성된 메모가 없습니다.</div> : (
              <div className={styles.memoGrid}>
                {filteredMemos.map(m => (
                  <div key={m.id} className={styles.memoCard} onClick={() => handleOpenEditor(m)}>
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

          {/* 캔버스 뷰 */}
          <div className={`${styles.memoViewPanel} ${currentView === 'canvas' ? styles.active : ''}`}>
            <div 
              ref={boardRef}
              className={styles.canvasBoard} 
              style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
              onMouseDown={handleBoardMouseDown} onMouseMove={handleBoardMouseMove} onMouseUp={handleBoardMouseUp} onMouseLeave={handleBoardMouseUp}
              onDragOver={(e) => e.preventDefault()} onDrop={handleNodeDrop}
            >
              {filteredMemos.map(m => (
                <div 
                  key={m.id} className={styles.canvasNode} 
                  style={{ left: m.canvasX ?? 2500, top: m.canvasY ?? 2500, borderTop: `4px solid ${m.themeColor || 'var(--primary-color)'}` }}
                  draggable 
                  onDragStart={(e) => handleNodeDragStart(e, m.id)}
                >
                  <div className={styles.canvasNodeHeader}>{m.title || '제목 없음'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px', pointerEvents: 'none' }}>
                    {m.content ? m.content.replace(/<[^>]*>?/gm, '').trim().substring(0, 60) + '...' : "내용 없음"}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button className="wiki-btn" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={() => handleOpenEditor(m)}>✏️ 편집</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 풀스크린 에디터 모달 */}
      {isEditorOpen && (
        <div className="modal-overlay" style={{ zIndex: 100000, display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ width: '800px', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '15px 20px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input type="text" style={{ fontSize: '18px', fontWeight: 900, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', flex: 1 }} placeholder="메모 제목" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <select style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={editData.folder} onChange={e => setEditData({...editData, folder: e.target.value})}>
                  {folders.filter(f => f !== '전체 메모').map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button className="wiki-btn" style={{ background: 'var(--primary-color)', color: 'white' }} onClick={handleSaveMemo}>💾 저장</button>
                {activeMemoId && <button className="wiki-btn" style={{ background: 'transparent', color: '#e53e3e', border: '1px dashed #e53e3e' }} onClick={handleDeleteMemo}>🗑️</button>}
                <button className="wiki-btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => setIsEditorOpen(false)}>✖ 닫기</button>
              </div>
            </div>
            <textarea 
              style={{ flex: 1, padding: '20px', overflowY: 'auto', outline: 'none', fontSize: '14px', lineHeight: 1.6, background: 'var(--bg-color)', color: 'var(--text-primary)', border: 'none', resize: 'none' }} 
              placeholder="내용을 기록하세요..."
              value={editData.content} onChange={e => setEditData({...editData, content: e.target.value})}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoWorkspacePage;
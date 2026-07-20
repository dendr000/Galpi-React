// 파일 위치: src/pages/MemoWorkspace/MemoWorkspacePage.jsx
// 기능 요약: React Flow 기반 캔버스 보드 모듈 장착 및 기존 구형 물리 엔진 코드 완전 제거
// 버전: v3.0.0

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MemoWorkspace.module.css';
import MemoLeftTree from './MemoLeftTree';
import WorkspaceEditorModal from './WorkspaceEditorModal';
import MemoCanvasBoard from './canvas/MemoCanvasBoard';
import { useMemoWorkspaceData } from './useMemoWorkspaceData';

const MemoWorkspacePage = () => {
  const navigate = useNavigate();
  console.log("[MemoWorkspacePage] 메모 워크스페이스 컨트롤러 렌더링 개시");

  const {
    memos, setMemos, folders, currentFolder, setCurrentFolder,
    filteredMemos, relations, setRelations, extractTags,
    handleAddFolder, handleEditFolder, handleDeleteFolder
  } = useMemoWorkspaceData();

  const [currentView, setCurrentView] = useState("list");
  const [isTreeOpen, setIsTreeOpen] = useState(true);
  
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', folder: '기타' });

  const handleOpenEditor = (memo) => {
    if (memo) {
      setActiveMemoId(memo.id);
      setEditData({ title: memo.title, folder: memo.folder || '기타' });
    } else {
      setActiveMemoId(null);
      setEditData({ title: '', folder: currentFolder === '전체 메모' ? '기타' : currentFolder });
    }
    setIsEditorOpen(true);
  };

  return (
    <div style={{ overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <style>{`
        .galpi-outer-select [contenteditable="false"] { opacity: 0.4; filter: grayscale(100%); transition: 0.2s; }
        .galpi-outer-select [contenteditable="false"] *::selection { background: transparent !important; color: inherit !important; }
        .galpi-outer-select [contenteditable="false"] *::-moz-selection { background: transparent !important; color: inherit !important; }
        #memo-edit-content p { margin: 0.3em 0 !important; }
        #memo-edit-content div { margin-top: 0; margin-bottom: 0; }
        
        /* 캔버스 전용 커스텀 스타일 오버라이딩 */
        .react-flow__minimap { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 8px; }
        .react-flow__controls { box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
        .react-flow__controls-button { background: var(--surface-color); border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
        .react-flow__controls-button:hover { background: var(--table-bg-alt); }
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
          
          {/* 리스트 뷰 */}
          <div className={`${styles.memoViewPanel} ${currentView === 'list' ? styles.active : ''}`}>
            {filteredMemos.length === 0 ? <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>이 폴더에는 작성된 메모가 없습니다.</div> : (
              <div className={styles.memoGrid}>
                {filteredMemos.map(m => (
                  <div key={m.id} className={styles.memoCard} onClick={() => handleOpenEditor(m)} style={{ borderTop: `4px solid ${m.themeColor || 'var(--primary-color)'}`, opacity: m.isTrash ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className={styles.memoCardTitle}>{m.title || '제목 없음'} {m.isLocked ? '🔒' : ''}</h3>
                    </div>
                    <div className={styles.memoCardPreview}>{m.content ? m.content.replace(/<[^>]*>?/gm, '').trim() : "내용 없음"}</div>
                    
                    {/* 해시태그 렌더링 */}
                    {m.tags && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {m.tags.split(',').map((tag, idx) => (
                          <span key={idx} style={{ background: 'var(--table-bg-alt)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📂 {m.folder}</span>
                      <span>⏱️ {new Date(m.updatedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 캔버스 뷰 (React Flow 모듈 연동) */}
          <div className={`${styles.memoViewPanel} ${currentView === 'canvas' ? styles.active : ''}`}>
            {currentView === 'canvas' && (
              <MemoCanvasBoard 
                filteredMemos={filteredMemos}
                setMemos={setMemos}
                relations={relations}
                setRelations={setRelations}
                handleOpenEditor={handleOpenEditor}
              />
            )}
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
          extractTags={extractTags}
        />
      )}
    </div>
  );
};

export default MemoWorkspacePage;
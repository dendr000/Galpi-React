// 파일 위치: src/domains/memo/page/PageMemoMain.jsx
// 기능 요약: 통합 검색 바 및 태그 필터 배너 UI가 탑재된 순수 리스트 뷰 전용 메모 워크스페이스 레이아웃
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PageMemo.module.css';
import PageMemoSidebar from './components/PageMemoSidebar';
import PageMemoEditorModal from './PageMemoEditorModal';
import { usePageMemoData } from './hooks/usePageMemoData';
import { HomeIcon, SearchIcon, XIcon, FolderIcon, ClockIcon, LockIcon, FilePlusIcon } from '../shared/components/MemoIcons';

const PageMemoMain = () => {
  const navigate = useNavigate();

  const {
    memos, setMemos, folders, currentFolder, setCurrentFolder,
    filteredMemos, extractTags,
    searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    handleAddFolder, handleEditFolder, handleDeleteFolder
  } = usePageMemoData();

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
      `}</style>

      <header className={styles.memoTopBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="wiki-btn" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HomeIcon /> 홈으로
          </button>
          <h1 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)', fontWeight: 900 }}>메모장</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', display: 'flex' }}><SearchIcon /></span>
            <input
              type="text"
              placeholder="메모 제목 또는 내용 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px 6px 32px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none', width: '240px', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', color: 'white' }} onClick={() => handleOpenEditor(null)}>
            <FilePlusIcon /> 새 메모 작성
          </button>
        </div>
      </header>

      {selectedTag && (
        <div style={{ padding: '10px 20px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-color)' }}>#{selectedTag} 태그 교차 필터링 결과</span>
          <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '11px', background: 'var(--surface-color)' }} onClick={() => setSelectedTag(null)}>
            <XIcon /> 필터 해제
          </button>
        </div>
      )}

      <div className={styles.memoWorkspaceContainer}>
        <PageMemoSidebar 
          styles={styles} isTreeOpen={isTreeOpen} setIsTreeOpen={setIsTreeOpen}
          folders={folders} currentFolder={currentFolder} setCurrentFolder={setCurrentFolder}
          memos={memos} handleAddFolder={handleAddFolder} handleEditFolder={handleEditFolder} handleDeleteFolder={handleDeleteFolder}
        />

        <div className={styles.memoViewport} style={{ paddingLeft: isTreeOpen ? '300px' : '30px', overflowY: 'auto' }}>
          
          <div style={{ padding: '30px' }}>
            {filteredMemos.length === 0 ? <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>조회된 메모가 없습니다.</div> : (
              <div className={styles.memoGrid}>
                {filteredMemos.map(m => (
                  <div key={m.id} className={styles.memoCard} onClick={() => handleOpenEditor(m)} style={{ borderTop: `4px solid ${m.themeColor || 'var(--primary-color)'}`, opacity: m.isTrash ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className={styles.memoCardTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px 0' }}>
                        {m.title || '제목 없음'}
                        {m.isLocked && <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><LockIcon /></span>}
                      </h3>
                    </div>
                    <div className={styles.memoCardPreview}>{m.content ? m.content.replace(/<[^>]*>?/gm, '').trim() : "내용 없음"}</div>
                    
                    {m.tags && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {m.tags.split(',').map((tag, idx) => (
                          <span 
                            key={idx} 
                            style={{ background: 'var(--table-bg-alt)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedTag(tag.trim()); }}
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FolderIcon /> {m.folder}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ClockIcon /> {new Date(m.updatedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {isEditorOpen && (
        <PageMemoEditorModal 
          activeMemoId={activeMemoId} editData={editData} setEditData={setEditData}
          folders={folders} currentFolder={currentFolder} setIsEditorOpen={setIsEditorOpen}
          memos={memos} setMemos={setMemos} extractTags={extractTags}
        />
      )}
    </div>
  );
};

export default PageMemoMain;
// 파일 위치: src/domains/memo/page/PageMemoMain.jsx
// 기능 요약: 완전히 격리된 2개의 독립 탭 상태 배열(mainTabs, splitTabs)을 사용하여, 탭 닫기 간섭 현상을 원천 차단한 스플릿 레이아웃
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PageMemo.module.css';
import PageMemoSidebar from './components/PageMemoSidebar';
import PageMemoTabList from './components/PageMemoTabList';
import PageMemoEditorPane from './PageMemoEditorPane';
import { usePageMemoData } from './hooks/usePageMemoData';
import { HomeIcon, SearchIcon, XIcon, FolderIcon, ClockIcon, LockIcon, FilePlusIcon } from '../shared/components/MemoIcons';

const PageMemoMain = () => {
  const navigate = useNavigate();

  const {
    memos, setMemos, folders, currentFolder, setCurrentFolder,
    filteredMemos, paginatedMemos,
    searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    handleAddFolder, handleEditFolder, handleDeleteFolder,
    sortType, setSortType, itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage, totalPages,
    mainTabs, splitTabs, activeTabId, setActiveTabId, splitTabId, setSplitTabId, 
    isSplitMode, toggleSplitMode, handleOpenTab, handleCloseTab
  } = usePageMemoData();

  const [isTreeOpen, setIsTreeOpen] = useState(true);
  
  const [editData, setEditData] = useState({ title: '', folder: '기타' });
  const [splitEditData, setSplitEditData] = useState({ title: '', folder: '기타' });

  useEffect(() => {
    if (activeTabId) {
      const target = memos.find(m => String(m.id) === String(activeTabId));
      if (target) setEditData({ title: target.title, folder: target.folder || '기타' });
    }
  }, [activeTabId, memos]);

  useEffect(() => {
    if (splitTabId) {
      const target = memos.find(m => String(m.id) === String(splitTabId));
      if (target) setSplitEditData({ title: target.title, folder: target.folder || '기타' });
    }
  }, [splitTabId, memos]);

  return (
    <div style={{ overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        .galpi-outer-select [contenteditable="false"] { opacity: 0.4; filter: grayscale(100%); transition: 0.2s; }
        .galpi-outer-select [contenteditable="false"] *::selection { background: transparent !important; color: inherit !important; }
        .galpi-outer-select [contenteditable="false"] *::-moz-selection { background: transparent !important; color: inherit !important; }
        #memo-edit-content p { margin: 0.3em 0 !important; }
        #memo-edit-content div { margin-top: 0; margin-bottom: 0; }
        .galpi-tree-folder .folder-actions { opacity: 0; pointer-events: none; transition: opacity 0.1s; }
        .galpi-tree-folder:hover .folder-actions { opacity: 1; pointer-events: auto; }
        .galpi-tree-folder .folder-actions button:hover { background: var(--border-color) !important; border-radius: 4px; }
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
              placeholder="메모 제목 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px 6px 32px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none', width: '240px', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* 새 메모 작성 시 무조건 Main(상단) 패널 탭에 열리게 함 */}
          <button className="wiki-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', color: 'white' }} onClick={() => handleOpenTab(null, 'main')}>
            <FilePlusIcon /> 새 메모 작성
          </button>
        </div>
      </header>

      {selectedTag && (
        <div style={{ padding: '10px 20px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-color)' }}>#{selectedTag} 태그 필터링 결과</span>
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

        <div className={styles.memoViewport} style={{ paddingLeft: isTreeOpen ? '300px' : '30px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {/* ★ 상단(Main) 패널에는 mainTabs를 주입 */}
            <PageMemoTabList 
              openedTabs={mainTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} 
              handleCloseTab={handleCloseTab} isSplitMode={isSplitMode} toggleSplitMode={toggleSplitMode} paneType="main"
            />
            
            {activeTabId ? (
              <PageMemoEditorPane 
                activeMemoId={activeTabId} editData={editData} setEditData={setEditData}
                folders={folders} currentFolder={currentFolder} handleCloseTab={handleCloseTab}
                memos={memos} setMemos={setMemos} paneType="main" 
              />
            ) : (
              <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' }} className="galpi-sidebar-scroll">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>총 {filteredMemos.length}건</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className={styles.bbsSelect} value={sortType} onChange={e => setSortType(e.target.value)}>
                      <option value="name">가나다순</option>
                      <option value="date">최신 등록순</option>
                    </select>
                    <select className={styles.bbsSelect} value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
                      <option value={20}>20개씩 보기</option>
                      <option value={50}>50개씩 보기</option>
                      <option value={100}>100개씩 보기</option>
                    </select>
                  </div>
                </div>

                <div className={styles.bbsWrap}>
                  <div className={styles.bbsHeader}>
                    <div className={styles.bbsColTitle}>제목</div>
                    <div className={styles.bbsColFolder}>폴더</div>
                    <div className={styles.bbsColDate}>작성일</div>
                  </div>

                  {filteredMemos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>조회된 메모가 없습니다.</div>
                  ) : (
                    paginatedMemos.map(m => (
                      <div key={m.id} className={styles.bbsRow} onClick={() => handleOpenTab(m, 'main')}>
                        <div className={styles.bbsColTitle}>
                          {m.isLocked && <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', marginRight: '6px', verticalAlign: 'middle' }}><LockIcon size={12}/></span>}
                          <span className={styles.bbsItemTitle}>{m.title || '제목 없음'}</span>
                          {m.tags && (
                            <span className={styles.bbsInlineTags}>
                              {m.tags.split(',').slice(0, 2).map((t, i) => (
                                <span key={i} className={styles.bbsTagPill}>#{t.trim()}</span>
                              ))}
                            </span>
                          )}
                        </div>
                        <div className={styles.bbsColFolder}>{m.folder}</div>
                        <div className={styles.bbsColDate}>{new Date(m.updatedAt).toLocaleDateString('ko-KR')}</div>
                      </div>
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className={styles.paginationWrap}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page} 
                        className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isSplitMode && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, borderTop: '4px solid var(--primary-color)' }}>
              {/* ★ 하단(Split) 패널에는 splitTabs를 주입 */}
              <PageMemoTabList 
                openedTabs={splitTabs} activeTabId={splitTabId} setActiveTabId={setSplitTabId} 
                handleCloseTab={handleCloseTab} isSplitMode={isSplitMode} toggleSplitMode={toggleSplitMode} paneType="split"
              />
              {splitTabId ? (
                <PageMemoEditorPane 
                  activeMemoId={splitTabId} editData={splitEditData} setEditData={setSplitEditData}
                  folders={folders} currentFolder={currentFolder} handleCloseTab={handleCloseTab}
                  memos={memos} setMemos={setMemos} paneType="split"
                />
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  상단 탭에서 분할 화면에 표시할 메모를 선택하세요.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PageMemoMain;
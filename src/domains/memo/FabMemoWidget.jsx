import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosCore';
import MemoSidebar from './MemoSidebar';
import MemoEditor from './MemoEditor';
import { PenToolIcon, XIcon } from './components/MemoIcons';

const FabMemoWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [memoData, setMemoData] = useState([]);
  
  // ★ 초기 상태값을 '기타' 단일 항목으로 고정하여 레거시 폴더 부활 방지
  const [memoFolders, setMemoFolders] = useState(["기타"]);
  const [currentFolder, setCurrentFolder] = useState("기타");
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [sortMap, setSortMap] = useState({});
  const [selectedTag, setSelectedTag] = useState(null); 

  useEffect(() => {
    try {
      const storedSortMap = JSON.parse(localStorage.getItem('galpi-memo-sort-map'));
      if (storedSortMap) setSortMap(storedSortMap);

      // ★ 로컬 동기화의 기준점(Fallback)을 '기타'로 단일 고정
      let localFolders = ["기타"];
      const storedFolders = JSON.parse(localStorage.getItem('galpi-memo-folders'));
      if (storedFolders) localFolders = [...new Set([...localFolders, ...storedFolders])];
      
      setMemoFolders(localFolders);

      api.get('/api/memos').then(res => {
        if (res.data && res.data.length > 0) {
          setMemoData(res.data);
          localStorage.setItem('galpi-memos', JSON.stringify(res.data));

          const dbFolders = [...new Set(res.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set([...localFolders, ...dbFolders])];
          
          setMemoFolders(mergedFolders);
          localStorage.setItem('galpi-memo-folders', JSON.stringify(mergedFolders));
        }
      }).catch(err => {
        const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
        setMemoData(storedMemos);
      });
      
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    if (!document.getElementById('memo-selection-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-selection-styles';
      style.innerHTML = `
        .galpi-outer-select [contenteditable="false"] { opacity: 0.4; filter: grayscale(100%); transition: 0.2s; }
        .galpi-outer-select [contenteditable="false"] *::selection { background: transparent !important; color: inherit !important; }
        .galpi-outer-select [contenteditable="false"] *::-moz-selection { background: transparent !important; color: inherit !important; }
        #memo-edit-content p { margin: 0.3em 0 !important; }
        #memo-edit-content div { margin-top: 0; margin-bottom: 0; }
        .memo-move-item { padding:8px 12px; font-size:12px; cursor:pointer; transition:0.2s; font-weight:bold; color:var(--text-primary); }
        .memo-move-item:hover { background:var(--table-bg-alt); color:var(--primary-color); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      if (memoData.length === 0) {
        handleCreateMemo();
      } else if (!activeMemoId) {
        setActiveMemoId(memoData[0].id);
      }
    }
  };

  const handleCreateMemo = useCallback(() => {
    const newId = `local_${Date.now()}`;
    const targetFolder = currentFolder === "최근 7일" || currentFolder === "미분류" ? "기타" : currentFolder;
    
    const newMemo = { 
      id: newId, folder: targetFolder, title: "새로운 메모", content: "", 
      updatedAt: Date.now(), sortOrder: -1, canvasX: 2500, canvasY: 2500, themeColor: 'var(--surface-color)' 
    };
    
    setMemoData(prev => {
      const updated = [newMemo, ...prev];
      localStorage.setItem('galpi-memos', JSON.stringify(updated));
      return updated;
    });
    setActiveMemoId(newId);
  }, [currentFolder]);

  const activeMemo = memoData.find(m => String(m.id) === String(activeMemoId));

  return (
    <>
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9000, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', gap: '15px' }}>
        <button 
          onClick={toggleModal}
          style={{
            width: '56px', height: '56px', borderRadius: '50%', background: isOpen ? '#e53e3e' : 'var(--primary-color)',
            color: 'white', border: 'none', boxShadow: `0 4px 15px ${isOpen ? 'rgba(229,62,62,0.4)' : 'rgba(59,91,219,0.4)'}`,
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {isOpen ? <XIcon size={24} /> : <PenToolIcon size={24} />}
        </button>
      </div>

      {isOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            style={{ width: '1000px', maxWidth: '95vw', height: '80vh', minHeight: '600px', background: 'var(--surface-color)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <MemoSidebar 
              memoData={memoData} setMemoData={setMemoData}
              memoFolders={memoFolders} setMemoFolders={setMemoFolders}
              currentFolder={currentFolder} setCurrentFolder={setCurrentFolder}
              activeMemoId={activeMemoId} setActiveMemoId={setActiveMemoId}
              sortMap={sortMap} setSortMap={setSortMap}
              handleCreateMemo={handleCreateMemo}
              selectedTag={selectedTag} setSelectedTag={setSelectedTag}
            />
            <MemoEditor 
              activeMemo={activeMemo} 
              memoData={memoData} setMemoData={setMemoData}
              currentFolder={currentFolder}
              setActiveMemoId={setActiveMemoId}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FabMemoWidget;
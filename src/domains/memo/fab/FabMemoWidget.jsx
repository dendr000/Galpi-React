// 파일 위치: src/domains/memo/fab/FabMemoWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosCore';
import FabMemoSidebar from './components/FabMemoSidebar';
import FabMemoEditor from './FabMemoEditor';
import { PenToolIcon, XIcon } from '../shared/components/MemoIcons';

const FabMemoWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [memoData, setMemoData] = useState([]);
  
  const [memoFolders, setMemoFolders] = useState(["기타"]);
  const [currentFolder, setCurrentFolder] = useState("기타");
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [sortMap, setSortMap] = useState({});
  const [selectedTag, setSelectedTag] = useState(null); 

  useEffect(() => {
    try {
      const storedSortMap = JSON.parse(localStorage.getItem('galpi-memo-sort-map'));
      if (storedSortMap) setSortMap(storedSortMap);

      let localFolders = ["기타"];
      const storedFolders = JSON.parse(localStorage.getItem('galpi-memo-folders'));
      if (storedFolders) localFolders = [...new Set([...localFolders, ...storedFolders])];
      setMemoFolders(localFolders);

      const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
      setMemoData(storedMemos);

      const lastId = localStorage.getItem('galpi-last-active-memo');
      if (lastId && storedMemos.find(m => String(m.id) === String(lastId))) {
        setActiveMemoId(isNaN(Number(lastId)) ? lastId : Number(lastId));
      }

      api.get('/api/memos').then(res => {
        if (res.data) {
          setMemoData(prev => {
            const localMemos = prev.filter(m => String(m.id).startsWith('local_'));
            const merged = [...localMemos, ...res.data];
            localStorage.setItem('galpi-memos', JSON.stringify(merged));
            return merged;
          });

          const dbFolders = [...new Set(res.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set([...localFolders, ...dbFolders])];
          setMemoFolders(mergedFolders);
          localStorage.setItem('galpi-memo-folders', JSON.stringify(mergedFolders));
        }
      }).catch(err => {
         // 통신 실패 시 이미 로컬 데이터가 로드되어 있으므로 무시
      });
      
    } catch (e) {}
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
        
        /* ★ 추가된 표 가출 방지 및 줄바꿈 강제 족쇄 */
        #memo-edit-content table { 
          max-width: 100% !important; 
          table-layout: auto !important;
        }
        #memo-edit-content th, #memo-edit-content td { 
          white-space: pre-wrap !important; 
          word-break: break-word !important; 
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen && memoData.length === 0) {
      handleCreateMemo();
    } else if (!isOpen && !activeMemoId && memoData.length > 0) {
      setActiveMemoId(memoData[0].id);
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

  useEffect(() => {
    if (activeMemoId) {
      localStorage.setItem('galpi-last-active-memo', activeMemoId);
    }
  }, [activeMemoId]);

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
            <FabMemoSidebar 
              memoData={memoData} setMemoData={setMemoData}
              memoFolders={memoFolders} setMemoFolders={setMemoFolders}
              currentFolder={currentFolder} setCurrentFolder={setCurrentFolder}
              activeMemoId={activeMemoId} setActiveMemoId={setActiveMemoId}
              sortMap={sortMap} setSortMap={setSortMap}
              handleCreateMemo={handleCreateMemo}
              selectedTag={selectedTag} setSelectedTag={setSelectedTag}
            />
            <FabMemoEditor 
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
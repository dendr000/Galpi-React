// 파일 위치: src/components/domains/memo/FabMemoWidget.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosCore';
import MemoSidebar from '../MemoSidebar';
import MemoEditor from '../MemoEditor';

const FabMemoWidget = () => {
  console.log("[FabMemoWidget] 메모장 위젯 관제탑 렌더링 개시");

  const [isOpen, setIsOpen] = useState(false);
  const [memoData, setMemoData] = useState([]);
  const [memoFolders, setMemoFolders] = useState(["전체 메모", "설정 아이디어", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [sortMap, setSortMap] = useState({});

  // 1. 초기 데이터 로드 (DB 주도형 폴더 추출 및 로컬 병합)
  useEffect(() => {
    console.log("[FabMemoWidget] 초기 메모 데이터 및 설정값 로드 연산 수행");
    try {
      const storedSortMap = JSON.parse(localStorage.getItem('galpi-memo-sort-map'));
      if (storedSortMap) setSortMap(storedSortMap);

      let localFolders = ["전체 메모", "설정 아이디어", "기타"];
      const storedFolders = JSON.parse(localStorage.getItem('galpi-memo-folders'));
      if (storedFolders) localFolders = [...new Set([...localFolders, ...storedFolders])];
      
      setMemoFolders(localFolders);

      // 서버 API 연동을 통한 메모 데이터 및 폴더 추출
      api.get('/api/memos').then(res => {
        if (res.data && res.data.length > 0) {
          console.log("[FabMemoWidget] 서버 메모 데이터 동기화 완료. DB 기반 폴더명 스캔 개시.");
          setMemoData(res.data);
          localStorage.setItem('galpi-memos', JSON.stringify(res.data));

          // ★ DB 데이터에 존재하는 고유 폴더명 추출 후 기존 폴더 배열과 병합
          const dbFolders = [...new Set(res.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set([...localFolders, ...dbFolders])];
          
          setMemoFolders(mergedFolders);
          localStorage.setItem('galpi-memo-folders', JSON.stringify(mergedFolders));
        }
      }).catch(err => {
        console.log("[FabMemoWidget] 오프라인 모드: 로컬 메모 데이터 유지");
        const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
        setMemoData(storedMemos);
      });
      
    } catch (e) {
      console.error("[FabMemoWidget] 초기 데이터 로드 중 예외 발생:", e);
    }
  }, []);

  // 2. 가상 격리 모드용 글로벌 스타일 인젝션
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

  // 3. FAB 클릭 제어
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

  // 4. 새로운 메모 생성 로직
  const handleCreateMemo = useCallback(() => {
    console.log("[FabMemoWidget] 신규 빈 메모 생성 프로세스 가동");
    const newId = `local_${Date.now()}`;
    const targetFolder = currentFolder === "전체 메모" ? "기타" : currentFolder;
    
    // DB 스키마(Memo.java)의 기본값에 맞춘 초기 객체
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
            transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: isOpen ? 'rotate(45deg)' : 'none', fontSize: '24px'
          }}
        >
          {isOpen ? '+' : '📝'}
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
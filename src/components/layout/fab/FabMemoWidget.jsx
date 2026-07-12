// 파일 위치: src/components/fab/FabMemoWidget.jsx
// 기능 요약: 우측 하단 플로팅 액션 버튼(FAB) 렌더링, 메모장 모달 오버레이 제어 및 메모 데이터(폴더, 목록) 전역 상태 관제

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosCore';
import MemoSidebar from './MemoSidebar';
import MemoEditor from './MemoEditor';
import styles from './FabMemoWidget.module.css'; // 필요 시 CSS 모듈 연동 (또는 글로벌 CSS 사용)

const FabMemoWidget = () => {
  console.log("[FabMemoWidget] 메모장 위젯 관제탑 렌더링 개시");

  const [isOpen, setIsOpen] = useState(false);
  const [memoData, setMemoData] = useState([]);
  const [memoFolders, setMemoFolders] = useState(["전체 메모", "설정 아이디어", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [sortMap, setSortMap] = useState({});

  // 1. 초기 데이터 로드 (로컬 스토리지 및 API 연동)
  useEffect(() => {
    console.log("[FabMemoWidget] 초기 메모 데이터 및 설정값 로드 연산 수행");
    try {
      const storedFolders = JSON.parse(localStorage.getItem('galpi-memo-folders'));
      if (storedFolders) setMemoFolders(storedFolders);

      const storedSortMap = JSON.parse(localStorage.getItem('galpi-memo-sort-map'));
      if (storedSortMap) setSortMap(storedSortMap);

      const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
      setMemoData(storedMemos);

      // 서버 API 연동이 가능하다면 백그라운드에서 최신화 수행
      api.get('/api/memos').then(res => {
        if (res.data && res.data.length > 0) {
          console.log("[FabMemoWidget] 서버 메모 데이터 동기화 완료");
          setMemoData(res.data);
          localStorage.setItem('galpi-memos', JSON.stringify(res.data));
        }
      }).catch(err => console.log("[FabMemoWidget] 오프라인 모드: 로컬 메모 데이터 유지"));
      
    } catch (e) {
      console.error("[FabMemoWidget] 초기 데이터 로드 중 예외 발생:", e);
    }
  }, []);

  // 2. 가상 격리 모드용 글로벌 스타일 인젝션 (마운트 시 1회)
  useEffect(() => {
    if (!document.getElementById('memo-selection-styles')) {
      console.log("[FabMemoWidget] 가상 격리 모드 및 에디터 전용 글로벌 CSS 인젝션 가동");
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

  // 3. FAB 클릭 제어 (모달 오픈 시 기본 선택 로직 포함)
  const toggleModal = () => {
    console.log(`[FabMemoWidget] 위젯 모달 상태 토글: ${!isOpen}`);
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
    const newMemo = { id: newId, folder: targetFolder, title: "새로운 메모", content: "", updatedAt: Date.now(), sortOrder: -1 };
    
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
      {/* 플로팅 액션 버튼 렌더링 */}
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

      {/* 모달 오버레이 렌더링 */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}
          onClick={() => { console.log("[FabMemoWidget] 오버레이 클릭 - 모달 닫기"); setIsOpen(false); }}
        >
          <div 
            style={{ width: '1000px', maxWidth: '95vw', height: '80vh', minHeight: '600px', background: 'var(--surface-color)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 좌측 사이드바 (폴더 및 목록) */}
            <MemoSidebar 
              memoData={memoData} setMemoData={setMemoData}
              memoFolders={memoFolders} setMemoFolders={setMemoFolders}
              currentFolder={currentFolder} setCurrentFolder={setCurrentFolder}
              activeMemoId={activeMemoId} setActiveMemoId={setActiveMemoId}
              sortMap={sortMap} setSortMap={setSortMap}
              handleCreateMemo={handleCreateMemo}
            />

            {/* 우측 에디터 코어 */}
            <MemoEditor 
              activeMemo={activeMemo} 
              memoData={memoData} setMemoData={setMemoData}
              currentFolder={currentFolder}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FabMemoWidget;
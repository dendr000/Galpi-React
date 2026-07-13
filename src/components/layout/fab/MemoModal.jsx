// 파일 위치: src/components/layout/fab/MemoModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosCore';
import { useModalStore } from '../../../store/useModalStore';
import MemoSidebar from './memo/MemoSidebar';
import MemoEditor from './memo/MemoEditor';

const MemoModal = () => {
  const { closeModal } = useModalStore();
  const [memoData, setMemoData] = useState([]);
  const [memoFolders, setMemoFolders] = useState(["전체 메모", "설정 아이디어", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [sortMap, setSortMap] = useState({});

  useEffect(() => {
    try {
      // 1. 로컬 스토리지에 저장된 폴더 내역 불러오기
      let localFolders = ["전체 메모", "설정 아이디어", "기타"];
      const storedFolders = JSON.parse(localStorage.getItem('galpi-memo-folders'));
      if (storedFolders) {
        localFolders = [...new Set([...localFolders, ...storedFolders])];
      }
      setMemoFolders(localFolders);

      const storedSortMap = JSON.parse(localStorage.getItem('galpi-memo-sort-map'));
      if (storedSortMap) setSortMap(storedSortMap);

      const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
      setMemoData(storedMemos);

      // 2. 서버 통신 후 메모 및 DB 내 고유 폴더명 병합 스캔
      api.get('/api/memos').then(res => {
        if (res.data && res.data.length > 0) {
          setMemoData(res.data);
          localStorage.setItem('galpi-memos', JSON.stringify(res.data));

          // ★ 누락되었던 DB 기반 폴더 동적 스캔 및 병합 로직
          const dbFolders = [...new Set(res.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set([...localFolders, ...dbFolders])];
          
          setMemoFolders(mergedFolders);
          localStorage.setItem('galpi-memo-folders', JSON.stringify(mergedFolders));
        }
      }).catch(err => {});
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (memoData.length > 0 && !activeMemoId) {
      setActiveMemoId(memoData[0].id);
    } else if (memoData.length === 0) {
      handleCreateMemo();
    }
  }, [memoData, activeMemoId]);

  const handleCreateMemo = useCallback(() => {
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
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}
      onClick={closeModal}
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
        />
      </div>
    </div>
  );
};

export default MemoModal;
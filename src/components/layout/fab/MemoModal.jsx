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
      const storedFolders = JSON.parse(localStorage.getItem('galpi-memo-folders'));
      if (storedFolders) setMemoFolders(storedFolders);
      const storedSortMap = JSON.parse(localStorage.getItem('galpi-memo-sort-map'));
      if (storedSortMap) setSortMap(storedSortMap);
      const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
      setMemoData(storedMemos);

      api.get('/api/memos').then(res => {
        if (res.data && res.data.length > 0) {
          setMemoData(res.data);
          localStorage.setItem('galpi-memos', JSON.stringify(res.data));
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
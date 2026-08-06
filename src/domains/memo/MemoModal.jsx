// 파일 위치: src/domains/memo/MemoModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosCore';
import { useModalStore } from '../../store/useModalStore';
import MemoSidebar from './MemoSidebar';
import MemoEditor from './MemoEditor';

const MemoModal = () => {
  const { closeModal } = useModalStore();
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
      if (storedFolders) {
        localFolders = [...new Set([...localFolders, ...storedFolders])];
      }
      setMemoFolders(localFolders);

      // ★ 픽스 1: 로컬 캐시 우선 로드 및 마지막으로 보고 있던 메모 ID 복구
      const storedMemos = JSON.parse(localStorage.getItem('galpi-memos')) || [];
      setMemoData(storedMemos);

      const lastId = localStorage.getItem('galpi-last-active-memo');
      if (lastId && storedMemos.find(m => String(m.id) === String(lastId))) {
        setActiveMemoId(isNaN(Number(lastId)) ? lastId : Number(lastId));
      }

      // ★ 픽스 2: API 데이터 수신 시 덮어쓰지 않고 로컬 임시 메모와 안전하게 병합(Merge)
      api.get('/api/memos').then(res => {
        if (res.data) {
          setMemoData(prev => {
            // 저장되지 않은 임시 로컬 메모(local_...)만 추출해서 살려둠
            const localMemos = prev.filter(m => String(m.id).startsWith('local_'));
            const merged = [...localMemos, ...res.data];
            localStorage.setItem('galpi-memos', JSON.stringify(merged));
            return merged;
          });

          const dbFolders = [...new Set(res.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set([...localFolders, ...dbFolders])];
          setMemoFolders(mergedFolders);
          localStorage.setItem('galpi-memo-folders', JSON.stringify(mergedFolders));

          // API 로딩 성공 후에도 마지막 메모 포커스가 튕기지 않도록 유지
          if (lastId && res.data.find(m => String(m.id) === String(lastId))) {
            setActiveMemoId(isNaN(Number(lastId)) ? lastId : Number(lastId));
          }
        }
      }).catch(err => {});

    } catch (e) {}
  }, []);

  // 빈 데이터 초기화 및 활성 ID 유실 방어
  useEffect(() => {
    if (memoData.length > 0 && !activeMemoId) {
      const lastId = localStorage.getItem('galpi-last-active-memo');
      if (lastId && memoData.find(m => String(m.id) === String(lastId))) {
        setActiveMemoId(isNaN(Number(lastId)) ? lastId : Number(lastId));
      } else {
        setActiveMemoId(memoData[0].id);
      }
    }
  }, [memoData, activeMemoId]);

  // 마지막으로 본 액티브 메모 ID를 영구 기억
  useEffect(() => {
    if (activeMemoId) {
      localStorage.setItem('galpi-last-active-memo', activeMemoId);
    }
  }, [activeMemoId]);

  const handleCreateMemo = useCallback(() => {
    const newId = `local_${Date.now()}`;
    const targetFolder = ["전체 메모", "최근 7일", "미분류"].includes(currentFolder) ? "기타" : currentFolder;
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
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}
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
  );
};

export default MemoModal;
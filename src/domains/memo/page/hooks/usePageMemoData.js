// 파일 위치: src/domains/memo/page/hooks/usePageMemoData.js
// (위의 변경된 두 훅에서 쏟아지는 기능들을 메인 UI로 중계합니다.)

import { useState, useEffect } from 'react';
import api from '../../../../api/axiosCore';
import { usePageFolder } from './core/usePageFolder';
import { usePageFilter } from './core/usePageFilter';
import { usePageTab } from './core/usePageTab';

export const usePageMemoData = () => {
  const [memos, setMemos] = useState([]);
  const [folders, setFolders] = useState(["전체 메모", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const memosRes = await api.get('/api/memos');
        if (memosRes.data) {
          setMemos(memosRes.data);
          const dbFolders = [...new Set(memosRes.data.map(m => m.folder).filter(Boolean))];
          const mergedFolders = [...new Set(["전체 메모", "기타", ...dbFolders])];
          setFolders(mergedFolders);
        }
      } catch (err) {
        console.error("[usePageMemoData] 데이터 로드 실패", err);
      }
    };
    fetchData();
  }, []);

  const folderHooks = usePageFolder({ memos, setMemos, folders, setFolders, currentFolder, setCurrentFolder });
  const filterHooks = usePageFilter({ memos, currentFolder });
  const tabHooks = usePageTab({ memos, setMemos, currentFolder });

  return {
    memos, setMemos, folders, setFolders, currentFolder, setCurrentFolder,
    ...folderHooks,
    ...filterHooks,
    ...tabHooks
  };
};
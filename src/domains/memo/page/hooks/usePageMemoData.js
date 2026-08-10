import { useState, useEffect } from 'react';
import api from '../../../../api/axiosCore';
import { usePageFolder } from './core/usePageFolder';
import { usePageFilter } from './core/usePageFilter';
import { usePageTab } from './core/usePageTab';

export const usePageMemoData = () => {
  const [memos, setMemos] = useState([]);
  const [folders, setFolders] = useState(["전체 메모", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");

  // 초기 데이터 스캔 및 폴더 트리 병합
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

  // 분할된 비즈니스 로직 훅 조립
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
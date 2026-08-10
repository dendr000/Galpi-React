// 파일 위치: src/domains/memo/page/hooks/usePageMemoData.js
// 기능 요약: 페이지 전역 상태 관리 및 다중 탭 & 스플릿 뷰의 '완벽한 물리적 격리' 상태 엔진 탑재
import { useState, useEffect, useMemo } from 'react';
import api from '../../../../api/axiosCore';

export const usePageMemoData = () => {
  const [memos, setMemos] = useState([]);
  const [folders, setFolders] = useState(["전체 메모", "기타"]);
  const [currentFolder, setCurrentFolder] = useState("전체 메모");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  const [sortType, setSortType] = useState('name'); 
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // ★ 다중 탭 및 스플릿 뷰 상태의 '완벽한 물리적 격리'
  const [mainTabs, setMainTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitTabs, setSplitTabs] = useState([]);
  const [splitTabId, setSplitTabId] = useState(null);

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

  // 패널 타입(paneType)에 따라 대상 배열(Main or Split)을 분기하여 탭을 엽니다.
  const handleOpenTab = (memo, paneType = 'main') => {
    const newId = memo ? memo.id : `local_${Date.now()}`;
    let targetMemo = memo;

    if (!memo) {
      targetMemo = { 
        id: newId, folder: currentFolder === '전체 메모' ? '기타' : currentFolder, 
        title: "새로운 메모", content: "", updatedAt: Date.now(), isTrash: false 
      };
      setMemos(prev => [targetMemo, ...prev]);
    }

    if (paneType === 'main') {
      setMainTabs(prev => {
        if (!prev.find(t => String(t.id) === String(targetMemo.id))) return [...prev, targetMemo];
        return prev;
      });
      setActiveTabId(targetMemo.id);
    } else {
      setSplitTabs(prev => {
        if (!prev.find(t => String(t.id) === String(targetMemo.id))) return [...prev, targetMemo];
        return prev;
      });
      setSplitTabId(targetMemo.id);
    }
  };

  // 패널 타입(paneType)에 따라 대상 배열(Main or Split)에서만 탭을 닫습니다.
  const handleCloseTab = (e, memoId, paneType = 'main') => {
    e.stopPropagation();

    if (paneType === 'main') {
      const newTabs = mainTabs.filter(t => String(t.id) !== String(memoId));
      setMainTabs(newTabs);
      if (String(activeTabId) === String(memoId)) {
        setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      }
    } else {
      const newTabs = splitTabs.filter(t => String(t.id) !== String(memoId));
      setSplitTabs(newTabs);
      if (String(splitTabId) === String(memoId)) {
        setSplitTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      }
      if (newTabs.length === 0) {
        setIsSplitMode(false); // 하단 탭이 모두 닫히면 스플릿 화면 자동 종료
      }
    }
  };

  const toggleSplitMode = () => {
    if (isSplitMode) {
      setIsSplitMode(false);
    } else {
      setIsSplitMode(true);
      // 화면을 처음 분할할 때 하단 패널이 비어있다면, 상단 패널의 활성 탭을 복제해서 띄워줌
      if (splitTabs.length === 0 && activeTabId) {
        const currentMemo = mainTabs.find(m => String(m.id) === String(activeTabId));
        if (currentMemo) {
          setSplitTabs([currentMemo]);
          setSplitTabId(currentMemo.id);
        }
      }
    }
  };

  const handleAddFolder = (parentPath = '') => {
    const promptMsg = parentPath 
      ? `[${parentPath}] 하위에 생성할 폴더명:` 
      : "새로운 최상위 폴더 이름을 입력하세요:";
    const name = prompt(promptMsg);
    if (name && name.trim()) {
      const newPath = parentPath ? `${parentPath}/${name.trim()}` : name.trim();
      if (!folders.includes(newPath)) {
        setFolders(prev => [...prev, newPath]);
        setCurrentFolder(newPath);
      } else alert("이미 존재하는 경로입니다.");
    }
  };

  const handleEditFolder = async (targetPath) => {
    const path = targetPath || currentFolder;
    if (["전체 메모", "기타"].includes(path)) return alert("기본 시스템 폴더는 이름을 수정할 수 없습니다.");
    const oldName = path.split('/').pop();
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    const newName = prompt("수정할 폴더 이름을 입력하세요:", oldName);
    
    if (newName && newName.trim() && newName.trim() !== oldName) {
      const finalPath = parentPath ? `${parentPath}/${newName.trim()}` : newName.trim();
      if (folders.includes(finalPath)) return alert("이미 존재하는 폴더명입니다.");
      
      setFolders(prev => prev.map(f => {
        if (f === path) return finalPath;
        if (f.startsWith(`${path}/`)) return f.replace(`${path}/`, `${finalPath}/`);
        return f;
      }));
      
      const newData = memos.map(m => {
        if (m.folder === path) return { ...m, folder: finalPath, updatedAt: Date.now() };
        if (m.folder && m.folder.startsWith(`${path}/`)) return { ...m, folder: m.folder.replace(`${path}/`, `${finalPath}/`), updatedAt: Date.now() };
        return m;
      });
      setMemos(newData);
      setCurrentFolder(finalPath);
      
      const affectedMemos = newData.filter(m => m.folder === finalPath || m.folder?.startsWith(`${finalPath}/`));
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("[usePageMemoData] 폴더명 변경 동기화 실패", e));
    }
  };

  const handleDeleteFolder = async (targetPath) => {
    const path = targetPath || currentFolder;
    if (["전체 메모", "기타"].includes(path)) return alert("기본 시스템 폴더는 삭제할 수 없습니다.");
    
    if (window.confirm(`'${path}' 폴더를 삭제하시겠습니까?\n(내부에 있던 메모는 모두 '기타' 폴더로 이관됩니다)`)) {
      setFolders(prev => prev.filter(f => f !== path && !f.startsWith(`${path}/`)));
      const newData = memos.map(m => {
        if (m.folder === path || (m.folder && m.folder.startsWith(`${path}/`))) {
          return { ...m, folder: "기타", updatedAt: Date.now() };
        }
        return m;
      });
      setMemos(newData);
      setCurrentFolder("기타");

      const affectedMemos = newData.filter(m => m.folder === "기타");
      Promise.all(affectedMemos.map(m => {
        const isEdit = !String(m.id).startsWith("local_") && String(m.id).length < 13;
        return isEdit ? api.put(`/api/memos/${m.id}`, m) : Promise.resolve();
      })).catch(e => console.warn("[usePageMemoData] 폴더 삭제 동기화 실패", e));
    }
  };

  const filteredMemos = useMemo(() => {
    let result = [...memos];
    if (currentFolder !== "전체 메모") result = result.filter(m => m.folder === currentFolder || m.folder?.startsWith(`${currentFolder}/`));
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => (m.title && m.title.toLowerCase().includes(q)) || (m.content && m.content.toLowerCase().includes(q)));
    }
    result = result.filter(m => !m.isTrash);
    if (selectedTag) {
      result = result.filter(m => {
        if (!m.tags) return false;
        const tags = m.tags.split(',').map(t => t.trim()).filter(Boolean);
        return tags.includes(selectedTag);
      });
    }
    result.sort((a, b) => {
      if (sortType === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
      return b.updatedAt - a.updatedAt;
    });
    return result;
  }, [memos, currentFolder, searchQuery, selectedTag, sortType]);

  const paginatedMemos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMemos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMemos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMemos.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFolder, searchQuery, selectedTag, sortType, itemsPerPage]);

  return {
    memos, setMemos, folders, setFolders, currentFolder, setCurrentFolder,
    filteredMemos, paginatedMemos,
    searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    handleAddFolder, handleEditFolder, handleDeleteFolder,
    sortType, setSortType, itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage, totalPages,
    mainTabs, splitTabs, activeTabId, setActiveTabId, splitTabId, setSplitTabId, // 분리된 배열 및 상태 방출
    isSplitMode, toggleSplitMode, handleOpenTab, handleCloseTab
  };
};
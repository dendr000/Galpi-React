// 파일 위치: src/domains/memo/hooks/useMemoSortAndDrag.js
import api from '../../../api/axiosCore';

export const useMemoSortAndDrag = ({ memoData, setMemoData, currentFolder, sortMap, setSortMap, selectedTag }) => {
  const handleSortChange = (e) => {
    const val = e.target.value;
    const newSortMap = { ...sortMap, [currentFolder]: val };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  const currentSort = sortMap[currentFolder] || 'name';

  let filteredMemos = [...memoData];

  if (currentFolder === "최근 7일") {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    filteredMemos = filteredMemos.filter(m => m.updatedAt >= sevenDaysAgo);
  } else if (currentFolder === "미분류") {
    filteredMemos = filteredMemos.filter(m => m.folder === '기타' || !m.tags || m.tags.trim() === "");
  } else if (currentFolder !== "전체 메모") {
    filteredMemos = filteredMemos.filter(m => m.folder === currentFolder);
  }

  if (selectedTag) {
    filteredMemos = filteredMemos.filter(m => {
      if (!m.tags) return false;
      const tags = m.tags.split(',').map(t => t.trim()).filter(Boolean);
      return tags.includes(selectedTag);
    });
  }

  filteredMemos.sort((a, b) => {
    if (currentSort === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
    if (currentSort === 'custom') return (a.sortOrder !== undefined ? a.sortOrder : 9999) - (b.sortOrder !== undefined ? b.sortOrder : 9999);
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    // 1. 드래그로 폴더 즉시 이동 엔진
    if (destination.droppableId.startsWith('folder_drop_')) {
      const targetFolder = destination.droppableId.replace('folder_drop_', '');
      const targetMemo = memoData.find(m => String(m.id) === draggableId);

      if (!targetMemo || targetMemo.folder === targetFolder) return;

      const updatedMemo = { ...targetMemo, folder: targetFolder, updatedAt: Date.now() };
      const newData = memoData.map(m => String(m.id) === draggableId ? updatedMemo : m);

      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));

      try {
        const isEdit = !String(targetMemo.id).startsWith("local_") && String(targetMemo.id).length < 13;
        if (isEdit) {
          await api.put(`/api/memos/${targetMemo.id}`, updatedMemo);
        }
      } catch (e) {
        console.error("폴더 이동 동기화 실패", e);
      }
      return; 
    }

    // 2. 리스트 내 순서 정렬 엔진
    if (["최근 7일", "미분류"].includes(currentFolder) || selectedTag) {
      alert("스마트 폴더 및 태그 검색 결과에서는 자유 정렬을 지원하지 않습니다.");
      return;
    }

    if (source.droppableId === destination.droppableId) {
      let targetItems = [];
      let folderNameForSort = currentFolder;

      if (source.droppableId === 'filtered-list-droppable') {
        targetItems = Array.from(filteredMemos);
      } else {
        // 트리 뷰 내부의 특정 폴더에서 정렬이 일어난 경우 (배열 오염 방지)
        folderNameForSort = source.droppableId;
        const currentSortForFolder = sortMap[folderNameForSort] || 'name';
        
        targetItems = memoData
          .filter(m => m.folder === folderNameForSort && !m.isTrash)
          .sort((a, b) => {
            if (currentSortForFolder === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
            if (currentSortForFolder === 'custom') return (a.sortOrder !== undefined ? a.sortOrder : 9999) - (b.sortOrder !== undefined ? b.sortOrder : 9999);
            return (b.updatedAt || 0) - (a.updatedAt || 0);
          });
      }

      const [reordered] = targetItems.splice(source.index, 1);
      targetItems.splice(destination.index, 0, reordered);

      const newData = memoData.map(m => {
        const foundIdx = targetItems.findIndex(item => String(item.id) === String(m.id));
        if (foundIdx !== -1) return { ...m, sortOrder: foundIdx };
        return m;
      });

      setMemoData(newData);
      localStorage.setItem('galpi-memos', JSON.stringify(newData));

      const newSortMap = { ...sortMap, [folderNameForSort]: 'custom' };
      setSortMap(newSortMap);
      localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
    }
  };

  return { currentSort, filteredMemos, handleSortChange, handleDragEnd };
};
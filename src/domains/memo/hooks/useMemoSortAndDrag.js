// 파일 위치: src/domains/memo/hooks/useMemoSortAndDrag.js
export const useMemoSortAndDrag = ({ memoData, setMemoData, currentFolder, sortMap, setSortMap, selectedTag }) => {
  const handleSortChange = (e) => {
    const val = e.target.value;
    const newSortMap = { ...sortMap, [currentFolder]: val };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  const currentSort = sortMap[currentFolder] || 'name';

  // 1차 필터링: 현재 폴더 소속 메모 추출
  let filteredMemos = currentFolder !== "전체 메모" ? memoData.filter(m => m.folder === currentFolder) : [...memoData];

  // 2차 필터링: 태그 교차 필터링 (선택된 태그가 있을 경우)
  if (selectedTag) {
    filteredMemos = filteredMemos.filter(m => {
      if (!m.tags) return false;
      const tags = m.tags.split(',').map(t => t.trim()).filter(Boolean);
      return tags.includes(selectedTag);
    });
  }

  // 정렬 수행
  filteredMemos.sort((a, b) => {
    if (currentSort === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
    if (currentSort === 'custom') return (a.sortOrder !== undefined ? a.sortOrder : 9999) - (b.sortOrder !== undefined ? b.sortOrder : 9999);
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(filteredMemos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const newData = memoData.map(m => {
      const foundIdx = items.findIndex(item => String(item.id) === String(m.id));
      if (foundIdx !== -1) return { ...m, sortOrder: foundIdx };
      return m;
    });

    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));
    
    const newSortMap = { ...sortMap, [currentFolder]: 'custom' };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  return { currentSort, filteredMemos, handleSortChange, handleDragEnd };
};
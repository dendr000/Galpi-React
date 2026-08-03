// 파일 위치: src/components/layout/fab/memo/hooks/useMemoSortAndDrag.js
export const useMemoSortAndDrag = ({ memoData, setMemoData, currentFolder, sortMap, setSortMap }) => {
  const handleSortChange = (e) => {
    const val = e.target.value;
    const newSortMap = { ...sortMap, [currentFolder]: val };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  const currentSort = sortMap[currentFolder] || 'date';
  let filteredMemos = currentFolder !== "전체 메모" ? memoData.filter(m => m.folder === currentFolder) : [...memoData];

  filteredMemos.sort((a, b) => {
    if (currentSort === 'name') return (a.title || "").localeCompare(b.title || "", 'ko-KR');
    if (currentSort === 'custom') return (a.sortOrder !== undefined ? a.sortOrder : 9999) - (b.sortOrder !== undefined ? b.sortOrder : 9999);
    return b.updatedAt - a.updatedAt;
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
// 파일 위치: src/domains/memo/fab/hooks/useFabMemoSortAndDrag.js
export const useFabMemoSortAndDrag = ({ memoData, setMemoData, currentFolder, sortMap, setSortMap, selectedTag }) => {
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

  return { currentSort, filteredMemos, handleSortChange };
};
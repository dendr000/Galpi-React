export const useMemoSortAndDrag = ({ memoData, setMemoData, currentFolder, sortMap, setSortMap, selectedTag }) => {
  const handleSortChange = (e) => {
    const val = e.target.value;
    const newSortMap = { ...sortMap, [currentFolder]: val };
    setSortMap(newSortMap);
    localStorage.setItem('galpi-memo-sort-map', JSON.stringify(newSortMap));
  };

  const currentSort = sortMap[currentFolder] || 'name';

  // 1. 스마트 폴더 및 일반 폴더 기준 필터링
  let filteredMemos = [...memoData];

  if (currentFolder === "최근 7일") {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    filteredMemos = filteredMemos.filter(m => m.updatedAt >= sevenDaysAgo);
  } else if (currentFolder === "미분류") {
    filteredMemos = filteredMemos.filter(m => m.folder === '기타' || !m.tags || m.tags.trim() === "");
  } else if (currentFolder !== "전체 메모") {
    filteredMemos = filteredMemos.filter(m => m.folder === currentFolder);
  }

  // 2. 태그 교차 필터링
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // 스마트 폴더 상태에서는 드래그 커스텀 정렬을 차단하여 데이터 오염 방지
    if (["최근 7일", "미분류"].includes(currentFolder)) {
      alert("스마트 폴더에서는 자유 정렬을 지원하지 않습니다.");
      return;
    }

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
import { useState, useEffect, useMemo } from 'react';

export const usePageFilter = ({ memos, currentFolder }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  const [sortType, setSortType] = useState('name'); 
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMemos = useMemo(() => {
    let result = [...memos];
    
    if (currentFolder !== "전체 메모") {
      result = result.filter(m => m.folder === currentFolder || m.folder?.startsWith(`${currentFolder}/`));
    }
    
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
    searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    sortType, setSortType, itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage, totalPages,
    filteredMemos, paginatedMemos
  };
};
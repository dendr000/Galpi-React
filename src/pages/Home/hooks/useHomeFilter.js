// 파일 위치: src/pages/Home/hooks/useHomeFilter.js
// 기능 요약: 뷰어 모드(Grid/List) 동기화, 검색어 자동완성 힌트 추출, 즐겨찾기/분류/작가 등 조건별 다중 필터 및 정렬 연산을 수행합니다.
import { useState, useEffect } from 'react';

export const useHomeFilter = ({ works, characters, favWorks }) => {
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [viewMode, setViewMode] = useState(localStorage.getItem('wiki-view') || 'grid');
  const [sortType, setSortType] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [searchHints, setSearchHints] = useState([]);

  useEffect(() => {
    localStorage.setItem('wiki-view', viewMode);
    console.log(`[useHomeFilter] 뷰 모드 로컬 스토리지 갱신: ${viewMode}`);
  }, [viewMode]);

  useEffect(() => {
    console.log("[useHomeFilter] 힌트 데이터 추출 연산 가동");
    const hints = new Set();
    if (filterType === 'genre') {
      works.forEach(w => {
        if (w.genre) w.genre.split(',').forEach(g => hints.add(g.trim()));
      });
    } else if (filterType === 'creator') {
      works.forEach(w => {
        if (w.creator) hints.add(w.creator.trim());
      });
    } else if (filterType === 'character') {
      characters.forEach(c => {
        if (c.name) hints.add(c.name.trim());
      });
    }
    setSearchHints(Array.from(hints).filter(Boolean));
  }, [filterType, works, characters]);

  useEffect(() => {
    console.log(`[useHomeFilter] 다중 필터 적용 연산 가동 - 정렬: ${sortType}, 필터: ${filterType}, 키워드: ${filterKeyword}`);
    let result = [...works];

    if (filterType === 'fav') {
      result = result.filter(w => favWorks.includes(w.id));
    } else if (filterKeyword.trim() !== '') {
      const kw = filterKeyword.toLowerCase().trim();
      if (filterType === 'genre') {
        result = result.filter(w => w.genre && w.genre.toLowerCase().includes(kw));
      } else if (filterType === 'creator') {
        result = result.filter(w => w.creator && w.creator.toLowerCase().includes(kw));
      } else if (filterType === 'character') {
        const targetWorkIds = characters.filter(c => c.name && c.name.toLowerCase().includes(kw)).map(c => c.workId);
        result = result.filter(w => targetWorkIds.includes(w.id));
      }
    }

    if (sortType === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ko-KR'));
    } else if (sortType === 'latest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortType === 'oldest') {
      result.sort((a, b) => a.id - b.id);
    }

    setFilteredWorks(result);
  }, [works, characters, favWorks, sortType, filterType, filterKeyword]);

  const resetFilters = () => {
    console.log("[useHomeFilter] 검색 및 정렬 필터값 초기화");
    setSortType('name');
    setFilterType('all');
    setFilterKeyword('');
  };

  return {
    viewMode, setViewMode,
    sortType, setSortType,
    filterType, setFilterType,
    filterKeyword, setFilterKeyword,
    searchHints, filteredWorks, resetFilters
  };
};
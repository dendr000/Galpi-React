// 파일 위치: src/pages/Home/useHomeData.js
// 연결 파일: src/pages/Home/HomePage.jsx와 연결되어 메인 페이지의 모든 상태와 비동기 통신을 제어합니다.
// 기능 요약: 작품 및 캐릭터 원장 데이터 패치, 숨김 카테고리 필터링 검열, 즐겨찾기 상태 관리, 다중 검색 필터 연산을 수행하는 커스텀 훅
// 버전: v2.0.0

import { useState, useEffect } from 'react';
import api from '../../api/axiosCore';
import { extractMeta } from '../../utils/markdownParser';

export const useHomeData = () => {
  const [works, setWorks] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState(localStorage.getItem('wiki-view') || 'grid');
  const [favWorks, setFavWorks] = useState(JSON.parse(localStorage.getItem('wiki-favs') || '[]'));
  
  const [sortType, setSortType] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [searchHints, setSearchHints] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      console.log("[useHomeData] 메인 대시보드 데이터 통신 개시");
      setIsLoading(true);
      try {
        const [worksRes, charsRes] = await Promise.all([
          api.get('/api/works'),
          api.get('/api/characters')
        ]);

        const rawWorks = worksRes.data;
        const charsData = charsRes.data;
        
        console.log(`[useHomeData] 서버 통신 완료 - 작품 수: ${rawWorks.length}, 캐릭터 수: ${charsData.length}`);

        const hiddenCats = JSON.parse(localStorage.getItem('galpi-hidden-categories') || '[]');
        const cleanHiddenCats = hiddenCats.map(cat => cat.replace(/[\s#*[\]]/g, '').toLowerCase());

        const processedWorks = rawWorks.map(w => {
          const parsed = extractMeta(w.description);
          return { ...w, metaInfo: parsed };
        }).filter(w => {
          if (cleanHiddenCats.length === 0) return true;
          let tags = [];
          if (w.genre) tags.push(...w.genre.split(','));
          
          const meta = w.metaInfo.meta;
          ['장르', '태그', '분류'].forEach(k => {
            if (meta[k]) tags.push(...String(meta[k]).split(','));
          });

          const isHidden = tags.some(t => {
            const cleanT = t.replace(/[\s#*[\]]/g, '').toLowerCase();
            return cleanHiddenCats.includes(cleanT);
          });

          if (isHidden) console.log(`[useHomeData] 🛑 검열 엔진 감지: 숨김 태그 포함 작품 차단됨 - ${w.title}`);
          return !isHidden;
        });

        setWorks(processedWorks);
        setCharacters(charsData);
      } catch (error) {
        console.error("[useHomeData] 데이터 통신 에러 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    localStorage.setItem('wiki-view', viewMode);
    console.log(`[useHomeData] 뷰 모드 로컬 스토리지 갱신: ${viewMode}`);
  }, [viewMode]);

  useEffect(() => {
    console.log("[useHomeData] 힌트 데이터 추출 연산 가동");
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
    console.log(`[useHomeData] 다중 필터 적용 연산 가동 - 정렬: ${sortType}, 필터: ${filterType}, 키워드: ${filterKeyword}`);
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

  const toggleFav = (e, id) => {
    e.stopPropagation();
    let newFavs;
    if (favWorks.includes(id)) {
      newFavs = favWorks.filter(fid => fid !== id);
      console.log(`[useHomeData] 즐겨찾기 해제: ID ${id}`);
    } else {
      newFavs = [...favWorks, id];
      console.log(`[useHomeData] 즐겨찾기 등록: ID ${id}`);
    }
    setFavWorks(newFavs);
    localStorage.setItem('wiki-favs', JSON.stringify(newFavs));
  };

  const toggleStatus = async (e, id) => {
    e.stopPropagation();
    const targetWork = works.find(w => w.id === id);
    if (!targetWork) return;

    const statuses = ["진행 전", "진행 중", "완료"];
    const curIdx = statuses.indexOf(targetWork.status);
    const nextStatus = statuses[(curIdx === -1 ? 0 : curIdx + 1) % statuses.length];

    console.log(`[useHomeData] 작품 상태 변경 통신 시작: ID ${id}, ${targetWork.status} -> ${nextStatus}`);
    
    const payload = { ...targetWork, status: nextStatus };
    delete payload.metaInfo; 

    try {
      await api.put(`/api/works/${id}`, payload);
      setWorks(works.map(w => w.id === id ? { ...w, status: nextStatus } : w));
      console.log(`[useHomeData] 작품 상태 변경 완료`);
    } catch (error) {
      console.error("[useHomeData] 상태 변경 통신 실패:", error);
    }
  };

  const resetFilters = () => {
    console.log("[useHomeData] 검색 및 정렬 필터값 초기화");
    setSortType('name');
    setFilterType('all');
    setFilterKeyword('');
  };

  return {
    works, filteredWorks, isLoading, viewMode, setViewMode,
    sortType, setSortType, filterType, setFilterType, filterKeyword, setFilterKeyword,
    searchHints, favWorks, toggleFav, toggleStatus, resetFilters
  };
};
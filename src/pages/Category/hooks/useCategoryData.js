// 파일 위치: src/pages/Category/hooks/useCategoryData.js
// API 통신, 데이터 가공(catMap), 로컬 스토리지 연동, 전역 이벤트 리스닝을 수행하는 두뇌 역할입니다.
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../api/axiosCore';
import { extractMeta } from '../../../utils/markdownParser';

export const useCategoryData = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetCat = searchParams.get('cat');

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiddenCats, setHiddenCats] = useState([]);
  const [isSecretMode, setIsSecretMode] = useState(false);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const res = await api.get('/api/works');
        setWorks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();

    const fetchHiddenCats = async () => {
      try {
        const res = await api.get('/api/hidden-categories');
        setHiddenCats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHiddenCats();
  }, []);

  const catMap = useMemo(() => {
    const map = {};
    works.forEach(w => {
      let tags = [];
      if (w.genre) tags.push(...w.genre.split(','));
      
      const parsed = extractMeta(w.description || "");
      if (parsed.meta) {
        ['장르', '태그', '분류'].forEach(k => {
          if (parsed.meta[k]) tags.push(...String(parsed.meta[k]).split(','));
        });
      }
      
      tags = tags.map(t => t.trim()).filter(Boolean);
      if (tags.length === 0) tags.push("미분류");

      [...new Set(tags)].forEach(t => {
        if (!map[t]) map[t] = [];
        map[t].push(w);
      });
    });
    return map;
  }, [works]);

  useEffect(() => {
    if (loading || Object.keys(catMap).length === 0) return;
    
    if (targetCat && catMap[targetCat]) {
      if (hiddenCats.includes(targetCat) && !isSecretMode) {
        setIsSecretMode(true);
      }
    }
  }, [loading, targetCat, catMap, hiddenCats, isSecretMode]);

  useEffect(() => {
    const handleSecretTrigger = () => {
      setIsSecretMode(true);
      setSearchParams({});
    };
    window.addEventListener('galpi-trigger-secret-mode', handleSecretTrigger);
    return () => window.removeEventListener('galpi-trigger-secret-mode', handleSecretTrigger);
  }, [setSearchParams]);

  const toggleHide = async (e, cat) => {
    e.stopPropagation();
    const isHidden = hiddenCats.includes(cat);
    const newHidden = isHidden ? hiddenCats.filter(c => c !== cat) : [...hiddenCats, cat];
    setHiddenCats(newHidden);

    try {
      if (isHidden) {
        await api.delete('/api/hidden-categories', { params: { categoryName: cat } });
      } else {
        await api.post('/api/hidden-categories', { categoryName: cat });
      }
    } catch (err) {
      console.error(err);
      setHiddenCats(hiddenCats);
    }
  };

  const openCategory = (cat) => {
    setSearchParams({ cat });
  };

  const showCatView = () => {
    setSearchParams({});
  };

  return {
    works,
    loading,
    catMap,
    targetCat,
    hiddenCats,
    isSecretMode,
    setIsSecretMode,
    toggleHide,
    openCategory,
    showCatView
  };
};
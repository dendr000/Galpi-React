// 파일 위치: src/pages/Home/hooks/useHomeFetch.js
// 기능 요약: 백엔드 API로부터 작품 및 캐릭터 원장을 호출하고, 마크다운 메타데이터 파싱 및 숨김(검열) 카테고리 필터링을 전담합니다.
import { useState, useEffect } from 'react';
import api from '../../../api/axiosCore';
import { extractMeta } from '../../../utils/markdownParser';

export const useHomeFetch = () => {
  const [works, setWorks] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      console.log("[useHomeFetch] 메인 대시보드 데이터 통신 개시");
      setIsLoading(true);
      try {
        const [worksRes, charsRes] = await Promise.all([
          api.get('/api/works'),
          api.get('/api/characters')
        ]);

        const rawWorks = worksRes.data;
        const charsData = charsRes.data;

        console.log(`[useHomeFetch] 서버 통신 완료 - 작품 수: ${rawWorks.length}, 캐릭터 수: ${charsData.length}`);

        const hiddenCats = JSON.parse(localStorage.getItem('galpi-hidden-categories') || '[]');
        const cleanHiddenCats = hiddenCats.map(cat => cat.replace(/[\s#*[\]]/g, '').toLowerCase());

        const processedWorks = rawWorks.map(w => {
          const parsed = extractMeta(w.description);
          return { ...w, metaInfo: parsed };
        }).filter(w => {
          if (cleanHiddenCats.length === 0) return true;
          let tags = [];
          if (w.genre) tags.push(...w.genre.split(','));

          const meta = w.metaInfo?.meta || {};
          ['장르', '태그', '분류'].forEach(k => {
            if (meta[k]) tags.push(...String(meta[k]).split(','));
          });

          const isHidden = tags.some(t => {
            const cleanT = t.replace(/[\s#*[\]]/g, '').toLowerCase();
            return cleanHiddenCats.includes(cleanT);
          });

          if (isHidden) console.log(`[useHomeFetch] 🛑 검열 엔진 감지: 숨김 태그 포함 작품 차단됨 - ${w.title}`);
          return !isHidden;
        });

        setWorks(processedWorks);
        setCharacters(charsData);
      } catch (error) {
        console.error("[useHomeFetch] 데이터 통신 에러 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return { works, setWorks, characters, isLoading };
};
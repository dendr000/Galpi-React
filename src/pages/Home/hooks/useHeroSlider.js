// 파일 위치: src/pages/Home/hooks/useHeroSlider.js
// 작품의 메타데이터를 검사하여 커버 이미지가 있는 요소만 필터링하고, 가로 슬라이딩 무한 루프 타이머를 통제합니다.
import { useState, useEffect } from 'react';

export const useHeroSlider = (works) => {
  const [slideWorks, setSlideWorks] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    console.log("[useHeroSlider] 배너 슬라이드 작품 필터링 연산 개시");
    const validWorks = works.filter(w => {
      const m = w.metaInfo?.meta || {};
      return (m.coverExt && m.coverExt.trim() !== "") || (m.cover && m.cover.trim() !== "");
    }).sort(() => Math.random() - 0.5);

    setSlideWorks(validWorks);
    console.log(`[useHeroSlider] 배너 슬라이드 확보 수량: ${validWorks.length}개`);
  }, [works]);

  useEffect(() => {
    if (slideWorks.length === 0) return;
    
    console.log("[useHeroSlider] 가로 슬라이딩 무한 루프 타이머 가동 (5초 인터벌)");
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % slideWorks.length);
    }, 5000);

    return () => {
      console.log("[useHeroSlider] 슬라이더 타이머 메모리 해제");
      clearInterval(interval);
    };
  }, [slideWorks.length]);

  return { slideWorks, currentIdx };
};
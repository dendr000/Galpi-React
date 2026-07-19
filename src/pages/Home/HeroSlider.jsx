// 파일 위치: src/pages/Home/HeroSlider.jsx
// 연결 파일: src/pages/Home/Home.module.css와 연결되어 배너 레이아웃을 형성합니다.
// 기능 요약: 메타데이터에 커버 이미지가 존재하는 작품들을 무작위 추출하여 무한 자동 스와이프를 구현하는 물리 엔진 배너 컴포넌트
// 버전: v1.0.0

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const HeroSlider = ({ works }) => {
  const navigate = useNavigate();
  const [slideWorks, setSlideWorks] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    console.log("[HeroSlider] 배너 슬라이드 작품 필터링 연산 개시");
    const validWorks = works.filter(w => {
      const m = w.metaInfo?.meta || {};
      return (m.coverExt && m.coverExt.trim() !== "") || (m.cover && m.cover.trim() !== "");
    }).sort(() => Math.random() - 0.5);

    setSlideWorks(validWorks);
    console.log(`[HeroSlider] 배너 슬라이드 확보 수량: ${validWorks.length}개`);
  }, [works]);

  useEffect(() => {
    if (slideWorks.length === 0) return;
    
    console.log("[HeroSlider] 가로 슬라이딩 무한 루프 타이머 가동 (5초 인터벌)");
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % slideWorks.length);
    }, 5000);

    return () => {
      console.log("[HeroSlider] 슬라이더 타이머 메모리 해제");
      clearInterval(interval);
    };
  }, [slideWorks.length]);

  if (slideWorks.length === 0) return null;

  return (
    <div className={styles['hero-slider-wrapper']}>
      <div 
        className={styles['hero-slider-inner']} 
        style={{ transform: `translateX(-${currentIdx * 100}%)` }}
      >
        {slideWorks.map(w => {
          const m = w.metaInfo?.meta || {};
          let coverUrl = "";
          if (m.coverExt) {
            coverUrl = `/img/cover/${encodeURIComponent(w.title + "." + m.coverExt.trim().replace(/^\./, ''))}`;
          } else if (m.cover) {
            coverUrl = `/img/cover/${encodeURIComponent(m.cover.replace('cover/', ''))}`;
          }

          const cx = m.coverX !== undefined ? m.coverX : 50;
          const cy = m.coverY !== undefined ? m.coverY : 50;
          const cz = m.coverZ !== undefined ? m.coverZ : "cover";

          const genreHtml = w.genre ? w.genre.split(',').map((g, i) => (
            <span key={i} className={styles['hero-genre-tag']}>{g.trim()}</span>
          )) : null;

          return (
            <div 
              key={w.id} 
              className={styles['hero-slide']}
              style={{
                backgroundImage: `url('${coverUrl}')`,
                backgroundPosition: `${cx}% ${cy}%`,
                backgroundSize: cz === "cover" ? "cover" : `${cz}%`
              }}
              onClick={() => {
                console.log(`[HeroSlider] 배너 클릭 라우팅 집행: 작품 ID ${w.id}`);
                navigate(`/work/${w.id}`);
              }}
            >
              <div className={styles['hero-overlay']}></div>
              <div className={styles['hero-content']}>
                <h1 className={styles['hero-title']} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* ★ 지시된 ci.svg 물리적 경로 삽입 */}
                  <img src="/img/svg/ci.svg" alt="Galpi CI" style={{ width: '45px', height: '45px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' }} />
                  {w.title}
                </h1>
                <p className={styles['hero-desc']}>
                  ✍️ {w.creator || '미상'} &nbsp;|&nbsp; 🏷️ {genreHtml}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroSlider;
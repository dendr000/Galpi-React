import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosCore';
import styles from './Category.module.css';
import { extractMeta } from '../utils/markdownParser';

const getGroupKey = (title) => {
  if (!title) return '기타';
  const char = title.trim().charAt(0);
  const code = char.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) { 
      const chosung = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
      let c = chosung[Math.floor((code - 0xAC00) / 588)];
      const map = {'ㄲ':'ㄱ', 'ㄸ':'ㄷ', 'ㅃ':'ㅂ', 'ㅆ':'ㅅ', 'ㅉ':'ㅈ'};
      return map[c] || c;
  }
  if (/[A-Za-z]/.test(char)) return char.toUpperCase();
  if (/[0-9]/.test(char)) return '0-9';
  return '기타';
};

const CategoryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetCat = searchParams.get('cat');

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiddenCats, setHiddenCats] = useState(() => JSON.parse(localStorage.getItem('galpi-hidden-categories') || '[]'));
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

  // ★ 다이렉트 렌더링 락: 로딩 중이거나 맵이 완성되지 않았다면 판정 보류
  useEffect(() => {
    if (loading || Object.keys(catMap).length === 0) return;
    
    if (targetCat && catMap[targetCat]) {
      if (hiddenCats.includes(targetCat) && !isSecretMode) {
        setIsSecretMode(true);
      }
    }
  }, [loading, targetCat, catMap, hiddenCats, isSecretMode]);

  // ★ 전역 컨텍스트 메뉴에서 보낸 비밀 모드 이벤트 리스닝
  useEffect(() => {
    const handleSecretTrigger = () => {
      setIsSecretMode(true);
      setSearchParams({});
    };
    window.addEventListener('galpi-trigger-secret-mode', handleSecretTrigger);
    return () => window.removeEventListener('galpi-trigger-secret-mode', handleSecretTrigger);
  }, [setSearchParams]);

  const toggleHide = (e, cat) => {
    e.stopPropagation();
    let newHidden = [...hiddenCats];
    if (newHidden.includes(cat)) {
      newHidden = newHidden.filter(c => c !== cat);
    } else {
      newHidden.push(cat);
    }
    setHiddenCats(newHidden);
    localStorage.setItem('galpi-hidden-categories', JSON.stringify(newHidden));
  };

  const openCategory = (cat) => {
    setSearchParams({ cat });
  };

  const showCatView = () => {
    setSearchParams({});
  };

  const renderWorkView = () => {
    const worksArray = catMap[targetCat] || [];
    if (worksArray.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>작품이 존재하지 않습니다.</div>;
    }

    const groups = {};
    worksArray.forEach(w => {
      const key = getGroupKey(w.title);
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const getPriority = (k) => {
        if (/[ㄱ-ㅎ]/.test(k)) return 1;
        if (/[A-Z]/.test(k)) return 2;
        if (/[0-9]/.test(k)) return 3;
        return 4;
      };
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      return a.localeCompare(b);
    });

    return (
      <div className={styles.namuContainer}>
        {sortedKeys.map(k => (
          <div key={k} className={styles.namuGroup}>
            <div className={styles.namuGroupTitle}>{k}</div>
            <ul className={styles.namuList}>
              {groups[k].sort((a,b) => (a.title||"").localeCompare(b.title||"")).map(w => (
                <li key={w.id}>
                  <span className={styles.namuLink} onClick={() => navigate(`/work/${w.id}`)}>{w.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  if (loading || Object.keys(catMap).length === 0) return <div style={{ padding: '50px', textAlign: 'center', fontWeight: 'bold' }}>데이터 구축 중...</div>;

  const sortedCats = Object.keys(catMap).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  const visibleCats = sortedCats.filter(cat => isSecretMode ? hiddenCats.includes(cat) : !hiddenCats.includes(cat));

  return (
    <div className={`${styles.catPageWrap} ${isSecretMode ? styles.secretTheme : ''}`}>
      
      <div className={styles.catHeader}>
        <h1 className={styles.catTitle}>
          {isSecretMode ? (
            <><span>🕵️</span> 비밀 금고 <span style={{ fontSize: '16px', color: '#e53e3e' }}>(필터링된 분류)</span></>
          ) : (
            <><span>🗂️</span> 작품 분류</>
          )}
        </h1>
        <div className={styles.catStats}>
          {targetCat ? (
            `특정 분류 다이렉트 검색: ${targetCat}`
          ) : isSecretMode ? (
            `메인 화면에서 격리된 데이터 열람 중`
          ) : (
            `전체 ${works.length}개 작품 / ${visibleCats.length}개 공개 분류`
          )}
        </div>
      </div>

      {targetCat ? (
        <div className={styles.workView}>
          <button className={styles.backBtn} onClick={showCatView}>⬅️ 분류 목록으로 돌아가기</button>
          <h2 className={styles.workViewTitle} style={{ margin: 0, color: 'var(--primary-color)' }}>
            📂 분류 : {targetCat} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({(catMap[targetCat] || []).length}개)</span>
          </h2>
          {renderWorkView()}
        </div>
      ) : (
        <div id="cat-view">
          {isSecretMode && (
            <div style={{ marginBottom: '20px' }}>
              <button className={styles.backBtn} onClick={() => setIsSecretMode(false)}>⬅️ 일반 메인 분류로 돌아가기</button>
            </div>
          )}
          
          {visibleCats.length > 0 ? (
            <div className={styles.catGrid}>
              {visibleCats.map(cat => {
                const isHidden = hiddenCats.includes(cat);
                return (
                  <div key={cat} className={styles.catCard} onClick={() => openCategory(cat)}>
                    <div className={styles.catName}>{cat}</div>
                    <div className={styles.catRightGroup}>
                      <div className={styles.catCount}>{catMap[cat].length}개</div>
                      <button 
                        className={styles.catToggleIconBtn} 
                        onClick={(e) => toggleHide(e, cat)} 
                        title={isHidden ? '메인 복구 (비밀 금고에서 방출)' : '메인 화면에서 숨기기'}
                      >
                        {isHidden ? '♻️' : '👁️'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              표시할 분류가 없습니다.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CategoryPage;
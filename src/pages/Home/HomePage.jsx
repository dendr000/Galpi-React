// 파일 위치: src/pages/Home/HomePage.jsx
// 연결 파일: src/pages/Home/Home.module.css와 연결되며, 분리된 훅과 컴포넌트들을 하나로 조립하여 출력합니다.
// 기능 요약: 메인 대시보드의 검색 툴바, 뷰 모드 스위처, Datalist 추천 검색, 갤러리 그리드를 렌더링하는 진입 페이지 컴포넌트
// 버전: v2.0.0

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { useHomeData } from './useHomeData';
import HeroSlider from './HeroSlider';
import WorkCard from './WorkCard';

const HomePage = () => {
  const navigate = useNavigate();
  console.log("[HomePage] 메인 컴포넌트 렌더링 사이클 진입");

  const {
    works, filteredWorks, isLoading, viewMode, setViewMode,
    sortType, setSortType, filterType, setFilterType, filterKeyword, setFilterKeyword,
    searchHints, favWorks, toggleFav, toggleStatus, resetFilters
  } = useHomeData();

  const handleQuickTagSearch = (tag) => {
    setFilterType('genre');
    setFilterKeyword(tag);
  };

  return (
    <div className="main-content-wrap">
      <div className="fixed-container">
        
        {/* 1. 상단 무한 스와이프 캐러셀 배너 */}
        {!isLoading && <HeroSlider works={works} />}

        {/* 2. 툴바 영역 (필터 및 검색 엔진 UI) */}
        <div className={styles['toolbar-wrap']}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: '0 15px 0 0', fontSize: '22px', fontWeight: 800 }}>📚 세계관 목록</h2>
            
            <button 
              type="button" 
              className="wiki-btn" 
              style={{ background: 'var(--surface-color)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: 900, cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 6px rgba(59,91,219,0.15)' }}
              onClick={() => navigate('/category')}
            >
              🗂️ 전체 분류 보기
            </button>
            
            <select className={styles['filter-select']} value={sortType} onChange={(e) => setSortType(e.target.value)}>
              <option value="name">가나다순</option>
              <option value="latest">최근 등록순</option>
              <option value="oldest">오래된순</option>
            </select>

            <select className={styles['filter-select']} value={filterType} onChange={(e) => {
              setFilterType(e.target.value);
              if (e.target.value === 'all' || e.target.value === 'fav') setFilterKeyword('');
            }}>
              <option value="all">전체</option>
              <option value="fav">⭐ 즐겨찾기</option>
              <option value="genre">분류</option>
              <option value="creator">작가</option>
              <option value="character">캐릭터</option>
            </select>
            
            {(filterType !== 'all' && filterType !== 'fav') && (
              <>
                <input 
                  type="text" 
                  className={styles['filter-input']} 
                  list="filter-hints" 
                  placeholder="검색어 입력" 
                  style={{ width: '150px' }} 
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  autoComplete="off"
                />
                <datalist id="filter-hints">
                  {searchHints.map((h, i) => (
                    <option key={i} value={h} />
                  ))}
                </datalist>
              </>
            )}

            {filterType !== 'all' && (
              <button 
                className="wiki-btn" 
                style={{ background: 'var(--text-secondary)', padding: '6px 12px', fontSize: '12px' }} 
                onClick={resetFilters}
              >
                초기화
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              {isLoading ? '로딩 중...' : `총 ${filteredWorks.length}개`}
            </span>
            <div className={styles['view-btn-group']}>
              <button className={`${styles['view-btn']} ${viewMode === 'grid' ? styles.active : ''}`} onClick={() => setViewMode('grid')} title="큰 카드 뷰">🔲</button>
              <button className={`${styles['view-btn']} ${viewMode === 'small' ? styles.active : ''}`} onClick={() => setViewMode('small')} title="작은 카드 뷰">▦</button>
              <button className={`${styles['view-btn']} ${viewMode === 'list' ? styles.active : ''}`} onClick={() => setViewMode('list')} title="리스트 뷰">📄</button>
            </div>
          </div>
        </div>
        
        {/* 3. 작품 그리드 영역 */}
        <div className={`${styles['work-grid']} ${styles[`view-${viewMode}`]}`}>
          {filteredWorks.length === 0 && !isLoading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
              조건에 맞는 작품이 없습니다.
            </div>
          ) : (
            filteredWorks.map((work) => (
              <WorkCard 
                key={work.id} 
                work={work} 
                viewMode={viewMode}
                isFav={favWorks.includes(work.id)}
                onToggleFav={toggleFav}
                onToggleStatus={toggleStatus}
                onQuickTagSearch={handleQuickTagSearch}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
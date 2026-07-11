import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosCore'; // 아까 만든 통신 파일
import styles from './Home.module.css'; // ★ CSS Module 불러오기

const Home = () => {
  const navigate = useNavigate();
  
  // 상태(State) 관리
  const [works, setWorks] = useState([]); // 작품 목록 데이터
  const [viewMode, setViewMode] = useState('grid'); // 보기 모드 (grid, small, list)
  const [isLoading, setIsLoading] = useState(true);

  // 화면이 렌더링될 때 백엔드 API 호출
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        // 프록시 설정이 되어있으므로 /api/works로 바로 요청!
        const response = await api.get('/api/works'); 
        
        // (참고) index.html에 있던 localStorage 기반 스포일러 숨김 필터 엔진 로직은 
        // 여기서 response.data를 filter() 하는 방식으로 추후 이식하면 완벽합니다.
        setWorks(response.data);
      } catch (error) {
        console.error("작품 목록 로딩 실패:", error);
        // 백엔드가 꺼져있을 때 화면 깨짐 방지용 더미 데이터
        setWorks([
          { id: 1, title: '흑야국 연대기', creator: '조성민', genre: '판타지,다크', status: '연재중' },
          { id: 2, title: '스타폴 아카데미', creator: '갈피', genre: 'SF,학원물', status: '완결' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorks();
  }, []);

  return (
    // 전역 클래스(main-content-wrap, fixed-container 등)는 문자열 그대로 쓰고, 
    // 모듈 CSS 클래스는 styles['클래스명'] 형태로 씁니다.
    <div className="main-content-wrap">
      <div className="fixed-container">
        
        {/* 1. 상단 배너 */}
        <div className={styles['hero-slider-wrapper']}>
          <div className={styles['hero-slider-inner']}>
            <div className={styles['hero-slide']}>
               <div className={styles['hero-overlay']}></div>
               <div className={styles['hero-content']}>
                 <h1 className={styles['hero-title']}>📚 갈피(Galpi) 세계관 목록</h1>
                 <p className={styles['hero-desc']}>나만의 세계관과 설정들을 체계적으로 관리하세요.</p>
               </div>
            </div>
          </div>
        </div>

        {/* 2. 툴바 영역 */}
        <div className={styles['toolbar-wrap']}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: '0 15px 0 0', fontSize: '22px', fontWeight: 800 }}>📚 세계관 목록</h2>
            <button 
              type="button" 
              className="wiki-btn" 
              style={{ background: 'var(--surface-color)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
              onClick={() => navigate('/category')}
            >
              🗂️ 전체 분류 보기
            </button>
            <select className={styles['filter-select']}>
              <option value="name">가나다순</option>
              <option value="latest">최근 등록순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              {isLoading ? '로딩 중...' : `총 ${works.length}개`}
            </span>
            {/* 상태(State)에 따라 버튼 색상(active 클래스) 동적 변경 */}
            <div className={styles['view-btn-group']}>
              <button className={`${styles['view-btn']} ${viewMode === 'grid' ? styles.active : ''}`} onClick={() => setViewMode('grid')}>🔲</button>
              <button className={`${styles['view-btn']} ${viewMode === 'small' ? styles.active : ''}`} onClick={() => setViewMode('small')}>▦</button>
              <button className={`${styles['view-btn']} ${viewMode === 'list' ? styles.active : ''}`} onClick={() => setViewMode('list')}>📄</button>
            </div>
          </div>
        </div>
        
        {/* 3. 작품 그리드 영역 */}
        {/* CSS Module에서 viewMode 상태에 따라 CSS를 동적으로 바꿈 */}
        <div className={`${styles['work-grid']} ${styles[`view-${viewMode}`]}`}>
          {works.map((work) => (
            // 카드를 클릭하면 라우터를 통해 작품 상세 페이지로 이동!
            <div key={work.id} className={styles['work-card']} onClick={() => navigate(`/work/${work.id}`)}>
              {viewMode !== 'list' && (
                <span className={styles['work-card-status']} style={{ background: 'var(--table-bg-alt)' }}>
                  {work.status || '상태 없음'}
                </span>
              )}
              <h3 className={styles['work-card-title']}>{work.title}</h3>
              <div className={styles['work-card-creator']}>✍️ {work.creator}</div>
              
              <div className={styles['work-card-genres']}>
                {work.genre && work.genre.split(',').map((g, idx) => (
                  <span key={idx} className={styles['genre-pill']}>{g.trim()}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Home;
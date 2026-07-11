import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosCore'; // 프록시 설정된 axios
import styles from './Category.module.css';

const CategoryPage = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null); // 클릭한 장르 보관용

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await api.get('/api/works');
        const workList = response.data || [];
        setWorks(workList);

        // 장르별로 맵핑(그룹핑) 하는 로직
        const catMap = { "미분류": [] };
        workList.forEach(work => {
          if (!work.genre) {
            catMap["미분류"].push(work);
            return;
          }
          const tags = work.genre.split(',').map(t => t.trim()).filter(t => t);
          if (tags.length === 0) {
            catMap["미분류"].push(work);
          } else {
            tags.forEach(tag => {
              if (!catMap[tag]) catMap[tag] = [];
              catMap[tag].push(work);
            });
          }
        });

        if (catMap["미분류"].length === 0) delete catMap["미분류"];
        setCategories(catMap);
      } catch (error) {
        console.error("작품 로드 실패", error);
      }
    };
    fetchWorks();
  }, []);

  return (
    <div className={styles['cat-wrap']}>
      <div className={styles['cat-header']}>
        <h1 className={styles['cat-title']}><span>🗂️</span> 작품 분류 보관소</h1>
        <div className={styles['cat-stats']}>총 {works.length}개의 작품 등록됨</div>
      </div>

      {/* activeCategory가 null이면 카드 뷰어, 값이 있으면 리스트 뷰어로 자동 전환! */}
      {!activeCategory ? (
        <div className={styles['cat-grid']}>
          {Object.entries(categories).map(([genreName, items]) => (
            <div 
              key={genreName} 
              className={styles['cat-card']}
              onClick={() => setActiveCategory(genreName)}
            >
              <h3 className={styles['cat-name']}>{genreName}</h3>
              <div className={styles['cat-right-group']}>
                <span className={styles['cat-count']}>{items.length}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles['work-view']}>
          <button className={styles['back-btn']} onClick={() => setActiveCategory(null)}>
            ⬅️ 분류 목록으로 돌아가기
          </button>
          
          <h2 style={{ margin: '15px 0', color: 'var(--primary-color)' }}>
            🏷️ '{activeCategory}' 분류에 속한 문서
          </h2>
          
          <div className={styles['namu-container']}>
            <div className={styles['namu-group']}>
              <div className={styles['namu-group-title']}>가나다순 정렬</div>
              <ul className={styles['namu-list']}>
                {categories[activeCategory]
                  .sort((a, b) => a.title.localeCompare(b.title)) // 가나다 정렬
                  .map(work => (
                    <li key={work.id}>
                      <span className={styles['namu-link']} onClick={() => navigate(`/work/${work.id}`)}>
                        {work.title}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                        (✍️ {work.creator || '작자미상'})
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
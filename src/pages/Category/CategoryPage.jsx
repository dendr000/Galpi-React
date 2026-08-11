import React from 'react';
import styles from './Category.module.css';
import { useCategoryData } from './hooks/useCategoryData';
import CategoryHeader from './components/CategoryHeader';
import CategoryGrid from './components/CategoryGrid';
import CategoryWorkList from './components/CategoryWorkList';
import { IconArrowLeft } from '../../components/common/icons/DomainIcons';

const CategoryPage = () => {
  const {
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
  } = useCategoryData();

  if (loading || Object.keys(catMap).length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontWeight: 'bold' }}>
        데이터 구축 중...
      </div>
    );
  }

  const sortedCats = Object.keys(catMap).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  const visibleCats = sortedCats.filter(cat => isSecretMode ? hiddenCats.includes(cat) : !hiddenCats.includes(cat));

  return (
    <div className={`${styles.catPageWrap} ${isSecretMode ? styles.secretTheme : ''}`}>
      
      <CategoryHeader 
        isSecretMode={isSecretMode}
        targetCat={targetCat}
        worksCount={works.length}
        visibleCatsCount={visibleCats.length}
      />

      {targetCat ? (
        <CategoryWorkList 
          targetCat={targetCat}
          catMap={catMap}
          showCatView={showCatView}
        />
      ) : (
        <div id="cat-view">
          {isSecretMode && (
            <div style={{ marginBottom: '20px' }}>
              <button 
                className={styles.backBtn} 
                onClick={() => setIsSecretMode(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <IconArrowLeft size={16} /> 일반 메인 분류로 돌아가기
              </button>
            </div>
          )}
          
          <CategoryGrid 
            visibleCats={visibleCats}
            catMap={catMap}
            hiddenCats={hiddenCats}
            toggleHide={toggleHide}
            openCategory={openCategory}
          />
        </div>
      )}

    </div>
  );
};

export default CategoryPage;
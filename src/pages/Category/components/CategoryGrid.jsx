// 파일 위치: src/pages/Category/components/CategoryGrid.jsx
import React from 'react';
import styles from '../Category.module.css';
import { IconEye, IconRestore } from '../../../components/common/icons/DomainIcons';

const CategoryGrid = ({ visibleCats, catMap, hiddenCats, toggleHide, openCategory }) => {
  if (visibleCats.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
        표시할 분류가 없습니다.
      </div>
    );
  }

  return (
    <div className={styles.catGrid}>
      {visibleCats.map(cat => {
        const isHidden = hiddenCats.includes(cat);
        return (
          <div key={cat} className={styles.catCard} onClick={() => openCategory(cat)}>
            <div className={styles.catName}>{cat}</div>
            <div className={styles.catRightGroup}>
              <div className={styles.catCount}>{catMap[cat]?.length || 0}개</div>
              <button 
                className={styles.catToggleIconBtn} 
                onClick={(e) => toggleHide(e, cat)} 
                title={isHidden ? '메인 복구 (비밀 금고에서 방출)' : '메인 화면에서 숨기기'}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isHidden ? <IconRestore size={16} color="#e53e3e" /> : <IconEye size={16} />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
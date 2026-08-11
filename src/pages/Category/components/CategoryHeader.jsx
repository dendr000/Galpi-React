// 파일 위치: src/pages/Category/components/CategoryHeader.jsx
import React from 'react';
import styles from '../Category.module.css';
import { IconArchive, IconSecret } from '../../../components/common/icons/DomainIcons';

const CategoryHeader = ({ isSecretMode, targetCat, worksCount, visibleCatsCount }) => {
  return (
    <div className={styles.catHeader}>
      <h1 className={styles.catTitle}>
        {isSecretMode ? (
          <>
            <span style={{ display: 'inline-flex', marginRight: '8px' }}><IconSecret size={24} color="#e53e3e" /></span>
            비밀 금고 <span style={{ fontSize: '16px', color: '#e53e3e', marginLeft: '6px' }}>(필터링된 분류)</span>
          </>
        ) : (
          <>
            <span style={{ display: 'inline-flex', marginRight: '8px' }}><IconArchive size={24} /></span>
            작품 분류
          </>
        )}
      </h1>
      <div className={styles.catStats}>
        {targetCat ? (
          `특정 분류 다이렉트 검색: ${targetCat}`
        ) : isSecretMode ? (
          `메인 화면에서 격리된 데이터 열람 중`
        ) : (
          `전체 ${worksCount}개 작품 / ${visibleCatsCount}개 공개 분류`
        )}
      </div>
    </div>
  );
};

export default CategoryHeader;
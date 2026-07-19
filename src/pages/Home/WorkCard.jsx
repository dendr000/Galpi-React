// 파일 위치: src/pages/Home/WorkCard.jsx
// 연결 파일: src/pages/Home/Home.module.css와 연결되어 개별 작품의 그리드 및 리스트 디자인을 형성합니다.
// 기능 요약: 뷰 모드에 따른 개별 작품 카드 렌더링, 즐겨찾기 토글, 상태 토글, 빠른 태그 검색 인터랙션을 제공하는 컴포넌트
// 버전: v1.0.0

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const WorkCard = ({ work, viewMode, isFav, onToggleFav, onToggleStatus, onQuickTagSearch }) => {
  const navigate = useNavigate();

  let statusColor = '#718096'; 
  let statusBg = 'rgba(113,128,150,0.1)'; 
  let displayStatus = work.status;

  if (displayStatus === '완료' || displayStatus === '완결') { 
    statusColor = '#10b981'; 
    statusBg = 'rgba(16,185,129,0.1)'; 
    displayStatus = '완료'; 
  } else if (displayStatus === '진행 중') { 
    statusColor = '#3b5bdb'; 
    statusBg = 'rgba(59,91,219,0.1)'; 
  } else { 
    displayStatus = '진행 전'; 
  }

  const tags = work.genre ? work.genre.split(',').slice(0, viewMode === 'list' ? 3 : 4) : [];

  return (
    <div 
      className={styles['work-card']} 
      onClick={() => {
        console.log(`[WorkCard] 작품 카드 클릭 라우팅: ID ${work.id}`);
        navigate(`/work/${work.id}`);
      }}
    >
      <button 
        className={`${styles['fav-btn']} ${isFav ? styles['active'] : ''}`} 
        onClick={(e) => onToggleFav(e, work.id)} 
        title="즐겨찾기 추가/해제"
      >
        {isFav ? '⭐' : '☆'}
      </button>

      <span 
        className={styles['work-card-status']} 
        style={{ color: statusColor, background: statusBg, border: `1px solid ${statusColor}` }} 
        onClick={(e) => onToggleStatus(e, work.id)}
      >
        {displayStatus}
      </span>

      <h3 className={styles['work-card-title']}>{work.title}</h3>
      <div className={styles['work-card-creator']}>✍️ {work.creator || '미상'}</div>
      <div className={styles['work-card-preview']}></div>
      
      <div className={styles['work-card-genres']}>
        {tags.length > 0 ? tags.map((g, idx) => (
          <span 
            key={idx} 
            className={styles['genre-pill']} 
            onClick={(e) => {
              e.stopPropagation();
              console.log(`[WorkCard] 퀵 태그 검색 발동: ${g.trim()}`);
              onQuickTagSearch(g.trim());
            }}
          >
            {g.trim()}
          </span>
        )) : '-'}
      </div>
    </div>
  );
};

export default WorkCard;
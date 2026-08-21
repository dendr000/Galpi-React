// 파일 위치: src/pages/Home/WorkCard.jsx
// 기능 요약: 이모지(⭐/☆, ✍️)를 제거하고 DomainIcons.jsx의 커스텀 SVG로 교체하여 브라우저 간 렌더링 파편화를 막았습니다.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { IconStarActive, IconStarInactive, IconPen } from '../../components/common/icons/DomainIcons';

// 정갈한 서가 / 책등 뷰에서 쓰는 책등 색상 팔레트. 제목을 해시해 고정 배정 (새로고침해도 같은 색 유지)
const SPINE_HUES = ['var(--spine-navy)', 'var(--spine-wine)', 'var(--spine-forest)', 'var(--spine-brass)', 'var(--spine-slate)'];
const spineHueFor = (title = '') => {
  const sum = title.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return SPINE_HUES[sum % SPINE_HUES.length];
};

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
  const spineColor = spineHueFor(work.title);
  // 책갈피 리본은 세로쓰기라 공백이 빈 줄처럼 보여서 붙여씀 (진행 중 → 진행중)
  const ribbonStatus = displayStatus.replace(' ', '');

  // 책등 뷰: 책장에서 책등만 보이는 좁고 긴 블록 (정렬은 상단 정렬 드롭다운을 그대로 공유)
  if (viewMode === 'shelf') {
    return (
      <div
        className={styles['work-spine']}
        style={{ background: spineColor }}
        onClick={() => navigate(`/work/${work.id}`)}
        title={`${work.title} · ${work.creator || '미상'}${tags.length ? ' · ' + tags.map(g => g.trim()).join(', ') : ''}`}
      >
        <span className={styles['work-spine-title']}>{work.title}</span>
        <span className={styles['work-spine-foot']}>{displayStatus}</span>
      </div>
    );
  }

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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isFav ? <IconStarActive size={18} /> : <IconStarInactive size={18} color="var(--text-secondary)" />}
      </button>

      {viewMode === 'grid' ? (
        <>
          <div className={styles['work-card-spine']} style={{ background: spineColor }} />
          <div
            className={styles['work-card-ribbon']}
            style={{ background: spineColor }}
            onClick={(e) => onToggleStatus(e, work.id)}
            title="진행 상태 변경"
          >
            <span className={styles['work-card-ribbon-text']}>{ribbonStatus}</span>
          </div>
        </>
      ) : (
        <span
          className={styles['work-card-status']}
          style={{ color: statusColor, background: statusBg, border: `1px solid ${statusColor}` }}
          onClick={(e) => onToggleStatus(e, work.id)}
        >
          {displayStatus}
        </span>
      )}

      <h3 className={styles['work-card-title']}>{work.title}</h3>
      <div className={styles['work-card-creator']} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <IconPen size={12} color="var(--text-secondary)" /> {work.creator || '미상'}
      </div>
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
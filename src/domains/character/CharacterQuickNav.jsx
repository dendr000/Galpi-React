// 파일 위치: src/domains/character/CharacterQuickNav.jsx
// 기능 요약: 캐릭터 상세 정보 하단에 배치되어 클릭 시 해당 캐릭터의 갤러리 카드로 스크롤을 즉시 이동시키는 빠른 네비게이션 컴포넌트
// 버전: v1.0.0

import React from 'react';

const CharacterQuickNav = ({ characters, activeCharId, setActiveCharId, styles }) => {
  console.log("[CharacterQuickNav] 캐릭터 빠른 이동(퀵 네비) 컴포넌트 렌더링 시작");

  const handleNavClick = (id) => {
    console.log(`[CharacterQuickNav] 빠른 네비게이션 클릭 감지. 대상 ID: ${id}`);
    setActiveCharId(id);
    setTimeout(() => {
      const card = document.getElementById(`char-card-${id}`);
      if(card) {
        console.log(`[CharacterQuickNav] 타겟 카드 돔(DOM) 획득 성공. 스크롤 이동 집행.`);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.warn(`[CharacterQuickNav] 돔 트리에서 타겟 카드를 찾을 수 없습니다.`);
      }
    }, 100);
  };

  return (
    <div className={styles.quickNavContainer}>
      <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        🏃 캐릭터 빠른 이동
      </div>
      <div className={styles.quickNavBtnList}>
        {characters.map(c => {
          const tc = c.themeColor || 'var(--primary-color)';
          const isActive = activeCharId === c.id;
          return (
            <button
              key={c.id}
              className={styles.quickNavBtn}
              style={{ borderColor: tc, color: isActive ? 'white' : tc, backgroundColor: isActive ? tc : 'transparent' }}
              onClick={() => handleNavClick(c.id)}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterQuickNav;
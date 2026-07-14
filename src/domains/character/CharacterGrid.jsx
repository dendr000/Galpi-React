// 파일 위치: src/domains/character/CharacterGrid.jsx
// 기능 요약: 작품 상세 페이지 내에서 분류 기준에 따라 캐릭터 카드를 격자 형태로 배치하고 드래그 앤 드롭 및 시프트 클릭 의상 전환을 지원하는 독립 서브 컴포넌트
// 버전: v1.0.0

import React from 'react';

const CharacterGrid = ({
  styles,
  charSectionNum,
  groupCriteria,
  setGroupCriteria,
  setIsBatchImgModalOpen,
  navigate,
  workId,
  sortedGroupNames,
  groupedChars,
  cardVariants,
  setCardVariants,
  fullVariants,
  work,
  charExt,
  activeCharId,
  setActiveCharId,
  handleCharDragStart,
  handleCharDragOver,
  handleCharDragEnd
}) => {
  console.log("[CharacterGrid] 등장인물 갤러리 그리드 컴포넌트 렌더링 개시");

  const handleGroupCriteriaChange = (e) => {
    console.log(`[CharacterGrid] 분류 기준 변경 감지: ${e.target.value}`);
    setGroupCriteria(e.target.value);
  };

  const handleBatchModalOpen = () => {
    console.log("[CharacterGrid] 일괄 이미지 위치 조정 모달 트리거 활성화");
    setIsBatchImgModalOpen(true);
  };

  const handleNewCharClick = () => {
    console.log("[CharacterGrid] 새 캐릭터 추가 페이지 라우팅 집행");
    navigate(`/edit?type=char&action=new&workId=${workId}`);
  };

  return (
    <section id="sec-3" className={styles.wikiSection}>
      <div className={styles.sectionHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 id="sec-characters" className={`${styles.sectionHeaderTitle} auto-toc-target`}>
            {charSectionNum}. 등장인물 목록
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <label style={{ fontWeight: 'bold' }}>분류 기준:</label>
            <select 
              value={groupCriteria} 
              onChange={handleGroupCriteriaChange} 
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)', background: 'var(--surface-color)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="관계">관계별</option>
              <option value="소속">소속별</option>
              <option value="등급">등급별</option>
              <option value="종족">종족별</option>
              <option value="성별">성별별</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="wiki-btn" 
            title="일괄 이미지 위치 조정" 
            style={{ padding: '4px 10px', fontSize: '13px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} 
            onClick={handleBatchModalOpen}
          >
            🖼️
          </button>
          <button 
            className="wiki-btn" 
            style={{ padding: '4px 10px', fontSize: '13px' }} 
            onClick={handleNewCharClick}
          >
            + 새 캐릭터 추가
          </button>
        </div>
      </div>

      <div>
        {sortedGroupNames.map(gName => {
          console.log(`[CharacterGrid] 그룹 섹션 빌드 ➔ 그룹명: ${gName}, 인원 수: ${groupedChars[gName].length}`);
          return (
            <div key={gName} className={styles.relationGroup}>
              <h3 className={styles.relationHeader}>
                {gName} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({groupedChars[gName].length})</span>
              </h3>
              
              <div className={styles.characterGridContainer}>
                {groupedChars[gName].map(c => {
                  const vIdx = cardVariants[c.id] || 0;
                  const suffix = fullVariants[vIdx] ? `_${fullVariants[vIdx]}` : "";
                  const cardImgSrc = `/img/character/${encodeURIComponent(work.title + "_" + c.name + suffix + "." + charExt)}`;
                  
                  return (
                    <div 
                      key={c.id} 
                      id={`char-card-${c.id}`}
                      className={styles.noteCard} 
                      style={{ borderTop: `4px solid ${c.themeColor || 'var(--primary-color)'}`, backgroundColor: activeCharId === c.id ? 'var(--table-bg-alt)' : 'var(--surface-color)' }} 
                      onClick={(e) => {
                        if (e.shiftKey) {
                          e.preventDefault(); 
                          e.stopPropagation();
                          console.log(`[CharacterGrid] 캐릭터 ID [${c.id}] Shift+클릭 감지. 의상 배리언트 토글 작동.`);
                          if (fullVariants.length > 1) {
                            setCardVariants(prev => ({ ...prev, [c.id]: ((prev[c.id] || 0) + 1) % fullVariants.length }));
                          }
                        } else {
                          console.log(`[CharacterGrid] 캐릭터 카드 ID [${c.id}] 토글 동작 집행`);
                          setActiveCharId(activeCharId === c.id ? null : c.id);
                        }
                      }}
                      draggable="true"
                      onDragStart={(e) => { console.log(`[CharacterGrid] 드래그 시작 캐릭터: ${c.name}`); handleCharDragStart(e, c, gName); }}
                      onDragOver={(e) => handleCharDragOver(e, c, gName)}
                      onDrop={(e) => e.preventDefault()}
                      onDragEnd={(e) => { console.log(`[CharacterGrid] 드래그 종료`); handleCharDragEnd(e, gName); }}
                    >
                      <div className={styles.cardImgWrap}>
                        <img 
                          src={cardImgSrc} 
                          style={{ 
                            objectPosition: `center ${c.cardImgY !== undefined ? c.cardImgY : 50}%`,
                            transform: `scale(${c.cardImgScale !== undefined ? c.cardImgScale : 1})`,
                            transition: 'transform 0.2s ease, object-position 0.2s ease'
                          }} 
                          onError={(e) => { 
                            console.warn(`[CharacterGrid] 이미지 로드 실패 처리: ${cardImgSrc}`);
                            e.target.style.display = 'none'; 
                            e.target.parentElement.style.background = 'var(--table-bg-alt)'; 
                          }} 
                          alt={c.name} 
                        />
                      </div>
                      <h4 style={{ margin: '0 0 5px 0', color: c.themeColor || 'var(--primary-color)', fontSize: '15px', fontWeight: 900 }}>{c.name}</h4>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CharacterGrid;
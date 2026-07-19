// 파일 위치: src/domains/character/CharacterGrid.jsx
// 기능 요약: 작품 상세 페이지 내에서 분류 기준에 따라 캐릭터 카드를 격자 형태로 배치하고 속성값(이름 옆/아래)을 렌더링하는 독립 서브 컴포넌트
// 버전: v1.1.0

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
                  
                  // ★ 캐릭터 속성 데이터 파싱 로직
                  let dp = {};
                  try {
                    dp = JSON.parse(c.dynamicProperties || c._rawDynamic || "{}");
                  } catch (e) {}

                  // 1. 이름 옆 (label1) 파싱
                  const label1Key = dp._cardLabel1 || "나이";
                  const mappedKey1 = label1Key === '나이' ? 'age' : label1Key === '성별' ? 'gender' : label1Key === '종족' ? 'species' : label1Key;
                  const val1 = dp[label1Key] || c[mappedKey1];
                  const label1Text = val1 ? `(${val1})` : "";

                  // 2. 이름 아래 (label2) 파싱
                  const label2Str = dp._cardLabel2 || "등급, 소속, 능력";
                  const label2Keys = label2Str.split(',').map(s => s.trim()).filter(Boolean);

                  return (
                    <div 
                      key={c.id} 
                      id={`char-card-${c.id}`}
                      className={styles.noteCard} 
                      style={{ borderTop: `4px solid ${c.themeColor || 'var(--primary-color)'}`, backgroundColor: activeCharId === c.id ? 'var(--table-bg-alt)' : 'var(--surface-color)', padding: 0, overflow: 'hidden' }} 
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
                      {/* 상단 이미지 영역 */}
                      <div className={styles.cardImgWrap} style={{ margin: 0, borderRadius: 0, borderBottom: '1px solid var(--border-color)' }}>
                        <img 
                          src={cardImgSrc} 
                          style={{ 
                            objectPosition: `center ${c.cardImgY !== undefined ? c.cardImgY : 50}%`,
                            transform: `scale(${c.cardImgScale !== undefined ? c.cardImgScale : 1})`,
                            transition: 'transform 0.2s ease, object-position 0.2s ease',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }} 
                          onError={(e) => { 
                            console.warn(`[CharacterGrid] 이미지 로드 실패 처리: ${cardImgSrc}`);
                            e.target.style.display = 'none'; 
                            e.target.parentElement.style.background = 'var(--table-bg-alt)'; 
                          }} 
                          alt={c.name} 
                        />
                      </div>

                      {/* 하단 텍스트 정보 영역 */}
                      <div style={{ padding: '15px' }}>
                        {/* 이름 및 이름 옆 라벨 */}
                        <h4 style={{ margin: '0 0 12px 0', color: c.themeColor || 'var(--primary-color)', fontSize: '16px', fontWeight: 900 }}>
                          {c.name} <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{label1Text}</span>
                        </h4>

                        {/* 이름 아래 라벨 리스트 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                          {label2Keys.map(key => {
                            const mappedKey = key === '나이' ? 'age' : key === '성별' ? 'gender' : key === '종족' ? 'species' : key;
                            const val = dp[key] || c[mappedKey];
                            
                            if (!val) return null;
                            return (
                              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', textAlign: 'right' }}>{val}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

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
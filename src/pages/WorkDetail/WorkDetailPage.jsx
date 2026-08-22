// 파일 위치: src/pages/WorkDetail/WorkDetailPage.jsx
// 기능 요약: 전용 커스텀 데이터 훅으로부터 컴포넌트 라이프사이클 상태를 주입받아 도메인 단위 서브 모듈들을 조합하여 화면에 표출하는 순수 허브 레이아웃 파일
// 버전: v3.1.0 (비즈니스 상태 로직 완전 격리 개편본)

import React, { useEffect } from 'react';
import styles from '../../pages/WorkDetail/WorkDetail.module.css';
import './themes/wuxia.css';
import './themes/cyberpunk-neon.css';
import './themes/cyberpunk-terminal.css';
import './themes/cyberpunk-graffiti.css';
import { resolveGenreTheme } from '../../domains/work/genreTheme';
import GenreCursor from '../../components/common/GenreCursor';
import { extractMeta } from '../../utils/markdownParser';
import MarkdownRenderer from '../../domains/macro/MarkdownRenderer';
import FloatingLeftTree from '../../domains/work/FloatingLeftTree';
import FloatingToc from '../../domains/work/FloatingToc';

// 도메인 기능 컴포넌트 묶음 임포트
import WorkCover from '../../domains/work/WorkCover';
import WorkCategoryBar from '../../domains/work/WorkCategoryBar';
import SubPageList from '../../domains/work/SubPageList';

import CharacterInfobox from '../../domains/character/CharacterInfobox';
import CharacterGrid from '../../domains/character/CharacterGrid';
import CharacterDetailSection from '../../domains/character/CharacterDetailSection';
import CharacterQuickNav from '../../domains/character/CharacterQuickNav';
import BatchImageModal from '../../domains/character/BatchImageModal';

// ★ 핵심 데이터 격리 처리용 통합 커스텀 데이터 훅 연결
import { useWorkDetailData } from '../../domains/work/useWorkDetailData';
import { useCharacterDrag } from '../../domains/character/useCharacterDrag';

const WorkDetailPage = () => {
  console.log("[WorkDetailPage] 조립형 레이아웃 뷰 가동 개시");

  // 데이터 훅 선언을 통해 내부 상태 및 상태 변경 메서드 일괄 인젝션
  const data = useWorkDetailData();

  // 커스텀 드래그 인터랙션 제어 훅 바인딩
  const { handleCharDragStart, handleCharDragOver, handleCharDragEnd } = useCharacterDrag(data.characters, data.setCharacters, data.groupCriteria);

  // GNB 팔레트 버튼이 테마를 순환시키면(별도 API 호출) 여기서도 즉시 반영되도록 이벤트를 듣는다
  useEffect(() => {
    const handleThemeCycled = (e) => {
      if (String(e.detail.workId) !== String(data.workId)) return;
      data.setWork(prev => prev && ({ ...prev, description: e.detail.description }));
    };
    window.addEventListener('galpi-theme-cycled', handleThemeCycled);
    return () => window.removeEventListener('galpi-theme-cycled', handleThemeCycled);
  }, [data.workId]);

  if (data.loading || !data.work) {
    return <div className="fixed-container" style={{ padding: '50px 20px', color: 'var(--text-secondary)', fontWeight:'bold' }}>데이터베이스 스캔 중...</div>;
  }

  // 렌더링에 요구되는 메타데이터 및 이미지 경로 세팅
  const parsedDesc = extractMeta(data.work.description || "");
  const coverExt = parsedDesc.meta.coverExt;
  const charExt = parsedDesc.meta.charExt || "png";
  const imgVariants = parsedDesc.meta.imgVariants || []; 
  const fullVariants = ["", ...imgVariants.filter(v => v.trim() !== "")]; 
  const coverUrl = `/img/cover/${encodeURIComponent(data.work.title + "." + (coverExt || 'png'))}`;

  const activePage = data.pageId ? data.wikiPages.find(p => String(p.id) === String(data.pageId)) : null;
  const activeChar = data.characters.find(c => c.id === data.activeCharId);
  const genreTheme = resolveGenreTheme(data.work.genre, parsedDesc.meta.themeOverride);

  console.log("[WorkDetailPage] 캐릭터 은닉 처리 및 폼 체인지 파싱 시작");
  // 은닉 처리 및 폼 체인지 적용 (이중 파싱 방어 로직 추가)
  const baseChars = data.characters.filter(c => {
    try { 
      let dp = JSON.parse(c.dynamicProperties || c._rawDynamic || "{}"); 
      if (typeof dp === 'string') dp = JSON.parse(dp); 
      return !dp._isHidden; 
    } catch(e) { 
      console.warn(`[WorkDetailPage] 은닉 속성 파싱 에러 발생: ${c.name}`, e);
      return true; 
    }
  });

  const displayChars = baseChars.map(base => {
    console.log(`[WorkDetailPage] 캐릭터 폼 스왑 확인 진행: ${base.name}`);
    const activeFormId = data.formSwaps[base.id];
    if (activeFormId && activeFormId !== base.id) {
       const alt = data.characters.find(c => c.id === activeFormId);
       if (alt) return { ...alt, _baseCharId: base.id }; 
    }
    return { ...base, _baseCharId: base.id };
  });

  // 캐릭터 갤러리 정렬용 그룹 명칭 및 트리 추출 연산
  const groupedChars = {};
  displayChars.forEach(c => {
    const rawVal = c[data.groupCriteria] || "미분류";
    const tags = String(rawVal).split(',').map(s => s.trim()).filter(Boolean);
    let validTags = tags.filter(t => !t.startsWith('*'));
    if (validTags.length === 0) validTags = ["미분류"]; 
    validTags.forEach(tag => {
      if (!groupedChars[tag]) groupedChars[tag] = [];
      if (!groupedChars[tag].some(exist => exist.id === c.id)) groupedChars[tag].push(c);
    });
  });

  Object.keys(groupedChars).forEach(k => {
    console.log(`[WorkDetailPage] 그룹 정렬 연산 수행. 대상 그룹: ${k}`);
    groupedChars[k].sort((a, b) => {
      const getBaseSort = (char) => {
        const base = data.characters.find(bc => bc.id === char._baseCharId) || char;
        try {
          let dp = JSON.parse(base.dynamicProperties || base._rawDynamic || "{}");
          if (typeof dp === 'string') dp = JSON.parse(dp);
          return dp._groupSortOrders?.[k] ?? base.sortOrder ?? 999;
        } catch(e) { 
          console.warn(`[WorkDetailPage] 정렬 순서 파싱 에러 발생: ${char.name}`, e);
          return base.sortOrder ?? 999; 
        }
      };
      return getBaseSort(a) - getBaseSort(b);
    });
  });

  const groupOrderArray = parsedDesc.meta._groupOrder?.[data.groupCriteria] || [];
  const sortedGroupNames = Object.keys(groupedChars).sort((a, b) => {
    let idxA = groupOrderArray.indexOf(a);
    let idxB = groupOrderArray.indexOf(b);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

  return (
    <div className="main-content-wrap">
      {/* 1단계: 플로팅 사이드바 위젯 부착 구역 */}
      <FloatingLeftTree workId={data.workId} pageId={data.pageId} wikiPages={data.wikiPages} />
      <FloatingToc tocList={data.tocList} workId={data.workId} pageId={data.pageId} activePage={activePage} />
      <GenreCursor theme={genreTheme} zoneId="galpi-genre-zone" />

      <div id="galpi-genre-zone" className={`wiki-container fixed-container ${styles.wikiContainer}`} data-genre-theme={genreTheme || undefined}>
        
        {/* 2단계: 최상단 상향 링크 빵부스러기 경로 바 영역 */}
        {activePage && (
          <div className={styles.breadcrumbNav}>
            <span className={styles.breadcrumbLink} onClick={() => data.navigate(`/work/${data.workId}`)}>📚 {data.work.title}</span> 
            <span className={styles.breadcrumbSep}>&gt;</span>
            <span className={styles.breadcrumbCurrent}>📄 {activePage.title}</span>
          </div>
        )}

        {/* 3단계: 히어로 대표 표지 비주얼 배너 영역 */}
        {!activePage && (
          <WorkCover 
            work={data.work} workId={data.workId} coverExt={coverExt} coverUrl={coverUrl} 
            coverY={data.coverY} setCoverY={data.setCoverY} 
            isCoverEdit={data.isCoverEdit} setIsCoverEdit={data.setIsCoverEdit} 
            isCoverDragging={data.isCoverDragging} setIsCoverDragging={data.setIsCoverDragging} 
            setWork={data.setWork} 
          />
        )}

        {/* 4단계: 장르/분류 및 테마 선택 제어 패널 영역 */}
        {!activePage && (
          <div id="galpi-theme-row" style={{ borderRadius: '6px' }}>
            <WorkCategoryBar work={data.work} workId={data.workId} setWork={data.setWork} styles={styles} />
          </div>
        )}

        {/* 5단계: 메인 그리드 및 사이드 이중 레이아웃 구역 */}
        <div className={styles.wikiContentWrapper}>
          <main className={styles.wikiMain}>
            
            {/* 하위 위키 문서 뷰어 모드 및 메인 개요/세계관 분기 출력 */}
            {activePage ? (
              <section className={styles.wikiSection}>
                <div className={`${styles.sectionHeader} gt-section-header`}>
                  <h2 className={`${styles.sectionHeaderTitle} gt-section-title`} style={{ color: 'var(--primary-color)' }}>{activePage.title}</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => data.navigate(`/edit?type=page&action=edit&workId=${data.workId}&id=${activePage.id}`)}>✏️ 문서 편집</button>
                    <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px', background: 'transparent', color: '#e53e3e', border: '1px dashed #e53e3e' }} onClick={async () => {
                      if (window.confirm("⚠️ 경고: 이 하위 문서를 영구 삭제하시겠습니까?")) {
                        try {
                          await api.delete(`/api/wikipages/${activePage.id}`);
                          data.navigate(`/work/${data.workId}`);
                        } catch(e) { alert("삭제 실패"); }
                      }
                    }}>🗑️ 삭제</button>
                  </div>
                </div>
                <MarkdownRenderer rawText={activePage.content} />
              </section>
            ) : (
              <>
                <section id="sec-1" className={styles.wikiSection}>
                  <div className={`${styles.sectionHeader} gt-section-header`}>
                    <h2 id="sec-overview" className={`${styles.sectionHeaderTitle} gt-section-title auto-toc-target`}>1. 개요</h2>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 12px 0', lineHeight: 1.6, color: 'var(--text-secondary)' }}>제작자: <strong>{data.work.creator || '미상'}</strong> | 상태: <strong>[{data.work.status || '진행 중'}]</strong></p>
                    {parsedDesc.meta.overview && <MarkdownRenderer rawText={parsedDesc.meta.overview} />}
                  </div>
                </section>

                <section id="sec-2" className={styles.wikiSection}>
                  <div className={`${styles.sectionHeader} gt-section-header`}>
                    <h2 id="sec-worldview" className={`${styles.sectionHeaderTitle} gt-section-title auto-toc-target`}>2. 설정</h2>
                    <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => data.navigate(`/edit?type=work&action=edit&id=${data.work.id}`)}>✏️ 편집</button>
                  </div>
                  <MarkdownRenderer rawText={parsedDesc.clean} startH1={3} />
                </section>
              </>
            )}

            {/* 하위 소속 폴더 리스트 모듈 매운 조립 */}
            <SubPageList wikiPages={data.wikiPages} pageId={data.pageId} workId={data.workId} navigate={data.navigate} styles={styles} />

            {/* 정렬 연동 캐릭터 그리드 모듈 조립 */}
            {!activePage && (
              <CharacterGrid
                styles={styles}
                charSectionNum={data.charSectionNum}
                groupCriteria={data.groupCriteria}
                setGroupCriteria={data.setGroupCriteria}
                setIsBatchImgModalOpen={data.setIsBatchImgModalOpen}
                navigate={data.navigate}
                workId={data.workId}
                sortedGroupNames={sortedGroupNames}
                groupedChars={groupedChars}
                cardVariants={data.cardVariants}
                setCardVariants={data.setCardVariants}
                fullVariants={fullVariants}
                work={data.work}
                charExt={charExt}
                activeCharId={data.activeCharId}
                setActiveCharId={data.setActiveCharId}
                handleCharDragStart={handleCharDragStart}
                handleCharDragOver={handleCharDragOver}
                handleCharDragEnd={handleCharDragEnd}
              />
            )}

            {/* 현재 활성화된 캐릭터의 상세 프로필 설정 문서 출력 */}
            {!activePage && activeChar && (
              <CharacterDetailSection activeChar={activeChar} charSectionNum={data.charSectionNum} styles={styles} />
            )}

            {/* 캐릭터 하단 스크롤 트랙용 퀵 네비게이터 바 조립 */}
            {!activePage && activeChar && (
              <CharacterQuickNav characters={displayChars} activeCharId={data.activeCharId} setActiveCharId={data.setActiveCharId} styles={styles} />
            )}
            
          </main>
          
          {/* 스마트 정보 박스 배치 구역 */}
          <aside className={styles.wikiAside}>
            <CharacterInfobox char={activeChar} workId={data.workId} workTitle={data.work.title} charExt={charExt} imgVariants={imgVariants} setCharacters={data.setCharacters} setActiveCharId={data.setActiveCharId} characters={data.characters} cardVariants={data.cardVariants} setCardVariants={data.setCardVariants} formSwaps={data.formSwaps} setFormSwaps={data.setFormSwaps} />
          </aside>
        </div>
      </div>

      {/* 실시간 썸네일 Y축 드래그 조정 일괄 레이어 모달 */}
      <BatchImageModal isOpen={data.isBatchImgModalOpen} onClose={() => data.setIsBatchImgModalOpen(false)} characters={data.characters} work={data.work} charExt={charExt} batchImgY={data.batchImgY} setBatchImgY={data.setBatchImgY} setCharacters={data.setCharacters} />
    </div>
  );
};

export default WorkDetailPage;
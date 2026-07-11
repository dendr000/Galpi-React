import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from './WorkDetail.module.css';
import { extractMeta } from '../../utils/markdownParser';
import MarkdownRenderer from '../../components/macro/MarkdownRenderer';
import FloatingLeftTree from './FloatingLeftTree';
import FloatingToc from './FloatingToc';
import CharacterInfobox from './CharacterInfobox';

const WorkDetailPage = () => {
  const { workId } = useParams();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  const navigate = useNavigate();

  const [work, setWork] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [wikiPages, setWikiPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [coverY, setCoverY] = useState(50);
  const [isCoverEdit, setIsCoverEdit] = useState(false);
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const startY = useRef(0);

  const [groupCriteria, setGroupCriteria] = useState(() => localStorage.getItem(`galpi-char-group-${workId}`) || '관계');
  const [activeCharId, setActiveCharId] = useState(null);
  
  const [charSectionNum, setCharSectionNum] = useState(3);
  const [tocList, setTocList] = useState([]);

  useEffect(() => {
    localStorage.setItem(`galpi-char-group-${workId}`, groupCriteria);
  }, [groupCriteria, workId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, cRes, pRes] = await Promise.all([
          api.get(`/api/works/${workId}`),
          api.get(`/api/characters?workId=${workId}`),
          api.get(`/api/wikipages/work/${workId}`).catch(() => ({ data: [] }))
        ]);
        
        setWork(wRes.data);
        const parsed = extractMeta(wRes.data.description);
        if (parsed.meta.coverY !== undefined) setCoverY(parsed.meta.coverY);

        const validChars = cRes.data.filter(c => !c.name?.includes('[시스템_프리셋_')).map(c => {
          let dp = {}; 
          try { 
              if(c.dynamicProperties) dp = JSON.parse(c.dynamicProperties);
              else if(c._rawDynamic) dp = JSON.parse(c._rawDynamic); 
          } catch(e){}
          return { ...c, ...dp, id: c.id };
        });
        
        setCharacters(validChars);
        setWikiPages(pRes.data);
        
        const savedY = sessionStorage.getItem('galpi-note-scroll-y');
        if (savedY) setTimeout(() => window.scrollTo({ top: parseInt(savedY, 10), behavior: 'smooth' }), 300);

      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workId, pageId, navigate]);

  // ★ 스마트 목차(TOC) 빌더 및 동적 문단 넘버링 계산
  useEffect(() => {
    if (loading || !work) return;
    setTimeout(() => {
      // 1. 가장 마지막에 쓰인 H1 번호 찾기
      let lastH1Num = 2; // 기본: 개요(1), 세계관(2)
      const mdH1s = document.querySelectorAll('.markdown-body h1');
      mdH1s.forEach(h => {
        const match = h.innerText.match(/^(\d+)\./);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > lastH1Num) lastH1Num = num;
        }
      });
      
      // 등장인물 문단 번호 업데이트 (다르면 상태 변경 후 재실행)
      if (charSectionNum !== lastH1Num + 1) {
        setCharSectionNum(lastH1Num + 1);
        return; 
      }

      // 2. 목차(TOC) 리스트 조립
      const headings = document.querySelectorAll('.auto-toc-target, .markdown-body h1, .markdown-body h2, .markdown-body h3');
      const tempToc = [];
      headings.forEach((h, index) => {
        if (!h.id) h.id = `galpi-auto-toc-${index}`;
        let lvl = 2;
        if (h.tagName.toLowerCase() === 'h1' || h.classList.contains('auto-toc-target')) lvl = 1;
        if (h.tagName.toLowerCase() === 'h3') lvl = 3;
        
        tempToc.push({ 
          id: `toc-item-${index}`, 
          targetId: h.id,
          text: h.innerText.replace(/✏️|➕/g, '').trim(), 
          level: lvl 
        });
      });
      setTocList(tempToc);
    }, 150); 
  }, [loading, work, pageId, activeCharId, charSectionNum]);

  useEffect(() => {
    const trackScroll = () => { if (window.scrollY > 0) sessionStorage.setItem('galpi-note-scroll-y', window.scrollY); };
    window.addEventListener('scroll', trackScroll);
    return () => window.removeEventListener('scroll', trackScroll);
  }, []);

  const handleCoverMouseDown = (e) => {
    if (!isCoverEdit) return;
    setIsCoverDragging(true);
    startY.current = e.clientY;
    e.preventDefault();
  };

  const handleCoverMouseMove = (e) => {
    if (!isCoverDragging || !isCoverEdit) return;
    const dy = (e.clientY - startY.current) / 350 * 100;
    startY.current = e.clientY;
    setCoverY(prev => Math.max(0, Math.min(100, prev - dy * 1.5)));
  };

  const handleCoverMouseUp = () => setIsCoverDragging(false);

  const saveCoverPosition = async () => {
    const parsed = extractMeta(work.description);
    parsed.meta.coverY = coverY;
    const finalDesc = `[META_DATA:${JSON.stringify(parsed.meta)}]\n${parsed.clean}`;
    try {
      await api.put(`/api/works/${workId}`, { ...work, description: finalDesc });
      setWork(prev => ({ ...prev, description: finalDesc }));
      setIsCoverEdit(false);
    } catch(e) {}
  };

  if (loading || !work) return <div className="fixed-container" style={{ padding: '50px 20px', color: 'var(--text-secondary)', fontWeight:'bold' }}>데이터베이스 스캔 중...</div>;

  const parsedDesc = extractMeta(work.description || "");
  const coverExt = parsedDesc.meta.coverExt;
  const charExt = parsedDesc.meta.charExt || "png";
  const coverUrl = `/img/cover/${encodeURIComponent(work.title + "." + (coverExt || 'png'))}`;

  const activePage = pageId ? wikiPages.find(p => String(p.id) === String(pageId)) : null;
  const childPages = pageId ? wikiPages.filter(p => String(p.parentId) === String(pageId)) : wikiPages.filter(p => !p.parentId);

  const groupedChars = {};
  characters.forEach(c => {
    const rawVal = c[groupCriteria] || "미분류";
    const tags = String(rawVal).split(',').map(s => s.trim()).filter(Boolean);
    const validTags = tags.filter(t => !t.startsWith('*'));
    if (validTags.length === 0) validTags.push("미분류");
    
    validTags.forEach(tag => {
      if (!groupedChars[tag]) groupedChars[tag] = [];
      if (!groupedChars[tag].some(exist => exist.id === c.id)) groupedChars[tag].push(c);
    });
  });

  const activeChar = characters.find(c => c.id === activeCharId);

  return (
    <div className="main-content-wrap">
      <FloatingLeftTree workId={workId} pageId={pageId} wikiPages={wikiPages} />
      <FloatingToc tocList={tocList} workId={workId} pageId={pageId} activePage={activePage} />

      <div className={`wiki-container fixed-container ${styles.wikiContainer}`}>
        
        {activePage && (
          <div className={styles.breadcrumbNav}>
            <span className={styles.breadcrumbLink} onClick={() => navigate(`/work/${workId}`)}>📚 {work.title}</span> 
            <span className={styles.breadcrumbSep}>&gt;</span>
            <span className={styles.breadcrumbCurrent}>📄 {activePage.title}</span>
          </div>
        )}

        {!activePage && (
          <div id="work-header-container" style={{ marginBottom: '20px' }}>
            {coverExt ? (
              <div 
                className={`${styles.workHeroBanner} ${isCoverDragging ? styles.isDragging : ''}`} 
                style={{ display: 'block', backgroundImage: `url('${coverUrl}')`, backgroundPosition: `50% ${coverY}%`, cursor: isCoverEdit ? (isCoverDragging ? 'ns-resize' : 'grab') : 'default' }}
                onMouseDown={handleCoverMouseDown} onMouseMove={handleCoverMouseMove} onMouseUp={handleCoverMouseUp} onMouseLeave={handleCoverMouseUp}
              >
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroTitleContainer}>
                  <h1 className={styles.heroTitle}>{work.title}</h1>
                </div>
                <div className={`${styles.coverControls} ${isCoverEdit ? styles.activeDrag : ''}`}>
                  {!isCoverEdit ? (
                    <button className="wiki-btn" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', borderRadius: '20px', padding: '6px 16px', fontWeight: 'bold' }} onClick={() => setIsCoverEdit(true)}>🖼️ 위치 및 크기 변경</button>
                  ) : (
                    <>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>↕️↔️ 마우스 드래그로 이동하세요.</span>
                      <button className="wiki-btn" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 16px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }} onClick={saveCoverPosition}>💾 저장</button>
                      <button className="wiki-btn" style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 16px', fontWeight: 'bold' }} onClick={() => setIsCoverEdit(false)}>✖ 취소</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.wikiTitleArea}>
                <h1 className={styles.wikiTitle}>{work.title}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="wiki-btn" style={{ background: 'transparent', color: '#e53e3e', border: '1px dashed #e53e3e' }} onClick={async () => {
                    if (window.confirm(`⚠️ 경고: [${work.title}] 작품을 영구 삭제하시겠습니까?\n작품에 속한 모든 캐릭터 정보도 함께 삭제됩니다.`)) {
                      try {
                        const charsRes = await api.get(`/api/characters?workId=${work.id}`);
                        await Promise.all(charsRes.data.map(c => api.delete(`/api/characters/${c.id}`)));
                        await api.delete(`/api/works/${work.id}`);
                        navigate('/');
                      } catch(e) { alert("삭제 실패"); }
                    }
                  }}>🗑️ 작품 삭제</button>
                </div>
              </div>
            )}
          </div>
        )}

        {!activePage && work.genre && (
          <div id="work-category" className={styles.wikiCategory}>
            <div style={{ fontWeight: 'bold', marginLeft: '10px', marginRight: '10px' }}>분류: </div>
            {work.genre.split(',').map(g => g.trim() && <span key={g} className={styles.wikiTagItem}>{g}</span>)}
            <div></div>
          </div>
        )}

        <div className={styles.wikiContentWrapper}>
          <main className={styles.wikiMain}>
            
            {activePage ? (
              <section className={styles.wikiSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionHeaderTitle} style={{ color: 'var(--primary-color)' }}>{activePage.title}</h2>
                  <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => navigate(`/edit?type=page&action=edit&workId=${workId}&id=${activePage.id}`)}>✏️ 문서 편집</button>
                </div>
                <MarkdownRenderer rawText={activePage.content} />
              </section>
            ) : (
              <>
                <section id="sec-1" className={styles.wikiSection}>
                  <div className={styles.sectionHeader}>
                    {/* ★ 목차 타겟 클래스 추가 */}
                    <h2 id="sec-overview" className={`${styles.sectionHeaderTitle} auto-toc-target`}>1. 개요</h2>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 12px 0', lineHeight: 1.6, color: 'var(--text-secondary)' }}>제작자: <strong>{work.creator || '미상'}</strong> | 상태: <strong>[{work.status || '진행 중'}]</strong></p>
                    {parsedDesc.meta.overview && (
                      <MarkdownRenderer rawText={parsedDesc.meta.overview} />
                    )}
                  </div>
                </section>

                <section id="sec-2" className={styles.wikiSection}>
                  <div className={styles.sectionHeader}>
                    {/* ★ 목차 타겟 클래스 추가 */}
                    <h2 id="sec-worldview" className={`${styles.sectionHeaderTitle} auto-toc-target`}>2. 세계관 설정</h2>
                    <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => navigate(`/edit?type=work&action=edit&id=${work.id}`)}>✏️ 편집</button>
                  </div>
                  {/* 세계관 마크다운은 기존 번호 뒤인 3번부터 넘버링 시작 */}
                  <MarkdownRenderer rawText={parsedDesc.clean} startH1={3} />
                </section>
              </>
            )}

            <section id="sec-wiki-pages" className={styles.wikiSection}>
              <div className={styles.sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* ★ 목차 타겟 클래스 추가 */}
                  <h2 id="sec-subpages" className={`${styles.sectionHeaderTitle} auto-toc-target`}>🗂️ 하위 문서 목록</h2>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{childPages.length}개</span>
                </div>
                <button className="wiki-btn" style={{ background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '4px 10px', fontSize: '13px' }} onClick={() => navigate(`/edit?type=page&action=new&workId=${workId}${pageId ? `&parentId=${pageId}` : ''}`)}>+ 새 문서 추가</button>
              </div>
              <div className={styles.wikiPageGrid}>
                {childPages.length > 0 ? childPages.map(page => (
                  <div key={page.id} className={styles.wikiPageCard} onClick={() => navigate(`/work/${workId}?pageId=${page.id}`)}>
                    <div className={styles.wikiPageTitle}>📄 {page.title}</div>
                    <div className={styles.wikiPageDesc}>{page.content ? page.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '내용이 없습니다.'}</div>
                  </div>
                )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '30px', background: 'var(--table-bg-alt)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>하위 문서가 없습니다. 우측의 '새 문서 추가' 버튼을 눌러보세요!</div>}
              </div>
            </section>

            {!activePage && (
              <section id="sec-3" className={styles.wikiSection}>
                <div className={styles.sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* ★ 목차 타겟 클래스 추가 및 동적 번호 할당 */}
                    <h2 id="sec-characters" className={`${styles.sectionHeaderTitle} auto-toc-target`}>{charSectionNum}. 등장인물 목록</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <label style={{ fontWeight: 'bold' }}>분류 기준:</label>
                      <select value={groupCriteria} onChange={e => setGroupCriteria(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)', background: 'var(--surface-color)', outline: 'none', cursor: 'pointer' }}>
                        <option value="관계">관계별</option><option value="소속">소속별</option><option value="등급">등급별</option><option value="종족">종족별</option><option value="성별">성별별</option>
                      </select>
                    </div>
                  </div>
                  <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => navigate(`/edit?type=char&action=new&workId=${workId}`)}>+ 새 캐릭터 추가</button>
                </div>
                <div>
                  {Object.keys(groupedChars).sort().map(gName => (
                    <div key={gName} className={styles.relationGroup}>
                      <h3 className={styles.relationHeader}>{gName} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({groupedChars[gName].length})</span></h3>
                      
                      <div className={styles.characterGridContainer}>
                        {groupedChars[gName].map(c => (
                          <div 
                            key={c.id} 
                            id={`char-card-${c.id}`}
                            className={styles.noteCard} 
                            style={{ borderTop: `4px solid ${c.themeColor || 'var(--primary-color)'}`, backgroundColor: activeCharId === c.id ? 'var(--table-bg-alt)' : 'var(--surface-color)' }} 
                            onClick={() => setActiveCharId(activeCharId === c.id ? null : c.id)}
                          >
                            <div className={styles.cardImgWrap}>
                              <img src={`/img/character/${encodeURIComponent(work.title + "_" + c.name + "." + charExt)}`} style={{ objectPosition: `50% ${c.cardImgY ?? 50}%` }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'var(--table-bg-alt)'; }} alt={c.name} />
                            </div>
                            <h4 style={{ margin: '0 0 5px 0', color: c.themeColor || 'var(--primary-color)', fontSize: '15px', fontWeight: 900 }}>{c.name}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!activePage && activeChar && (
              <section id="character-detail-section" className={styles.wikiSection}>
                <div className={styles.sectionHeader}>
                  {/* ★ 목차 타겟 클래스 추가 및 동적 번호 할당 */}
                  <h2 id="sec-chardetail" className={`${styles.sectionHeaderTitle} auto-toc-target`}>{charSectionNum + 1}. [{activeChar.name}] 상세 정보</h2>
                </div>
                <MarkdownRenderer rawText={activeChar.pageBody?.rawText || activeChar.pageBodyRaw || (activeChar._rawDynamic && JSON.parse(activeChar._rawDynamic).pageBody?.rawText) || "등록된 본문 내용이 없습니다."} startH1={charSectionNum + 2} />
              </section>
            )}

            {!activePage && activeChar && (
              <div className={styles.quickNavContainer}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>🏃 캐릭터 빠른 이동</div>
                <div className={styles.quickNavBtnList}>
                  {characters.map(c => {
                    const tc = c.themeColor || 'var(--primary-color)';
                    const isActive = activeCharId === c.id;
                    return (
                      <button
                        key={c.id}
                        className={styles.quickNavBtn}
                        style={{
                          borderColor: tc,
                          color: isActive ? 'white' : tc,
                          backgroundColor: isActive ? tc : 'transparent'
                        }}
                        onClick={() => {
                          setActiveCharId(c.id);
                          setTimeout(() => {
                            const card = document.getElementById(`char-card-${c.id}`);
                            if(card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
          </main>
          
          <aside className={styles.wikiAside}>
            <CharacterInfobox char={activeChar} workId={workId} workTitle={work.title} charExt={charExt} setCharacters={setCharacters} setActiveCharId={setActiveCharId} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WorkDetailPage;
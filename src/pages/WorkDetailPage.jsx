import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosCore';
import styles from './WorkDetail.module.css';
import { extractMeta } from '../utils/markdownParser';
import MarkdownRenderer from '../components/macro/MarkdownRenderer';

const WorkDetailPage = () => {
  const { workId } = useParams();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  const navigate = useNavigate();

  const [work, setWork] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [wikiPages, setWikiPages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 표지 드래그 제어용 상태
  const [coverY, setCoverY] = useState(50);
  const [isCoverEdit, setIsCoverEdit] = useState(false);
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const startY = useRef(0);

  // 캐릭터 정렬 및 인포박스 상태
  const [groupCriteria, setGroupCriteria] = useState('관계');
  const [activeCharId, setActiveCharId] = useState(null);

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

        // 시스템 전용 더미 캐릭터 필터링 및 JSON 파싱
        const validChars = cRes.data.filter(c => !c.name?.includes('[시스템_프리셋_')).map(c => {
          let dp = {}; try { dp = JSON.parse(c.dynamicProperties || c._rawDynamic || "{}"); } catch(e){}
          return { ...c, ...dp };
        });
        setCharacters(validChars);
        setWikiPages(pRes.data);
      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workId, navigate]);

  // --- 표지 드래그 물리 엔진 ---
  const handleCoverMouseDown = (e) => { if (!isCoverEdit) return; setIsCoverDragging(true); startY.current = e.clientY; };
  const handleCoverMouseMove = (e) => {
    if (!isCoverDragging) return;
    const dy = (e.clientY - startY.current) / 350 * 100;
    startY.current = e.clientY;
    setCoverY(prev => Math.max(0, Math.min(100, prev - dy * 1.5)));
  };
  const handleCoverMouseUp = () => setIsCoverDragging(false);
  
  const saveCoverY = async () => {
    const parsed = extractMeta(work.description);
    parsed.meta.coverY = coverY;
    const newDesc = `[META_DATA:${JSON.stringify(parsed.meta)}]\n${parsed.clean}`;
    await api.put(`/api/works/${workId}`, { ...work, description: newDesc });
    setWork({ ...work, description: newDesc });
    setIsCoverEdit(false);
  };

  // --- 다이어그램 노드 클릭 시 인포박스 매칭 로직 ---
  const handleNodeClick = (charName) => {
    const normalize = (s) => (s||"").replace(/\s+/g,'').toLowerCase();
    const targetChar = characters.find(c => normalize(c.name) === normalize(charName));
    if (targetChar) {
        setActiveCharId(targetChar.id);
        setTimeout(() => document.querySelector(`.${styles.asideArea}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } else alert(`'${charName}' 캐릭터 정보가 없습니다.`);
  };

  if (loading || !work) return <div className="fixed-container" style={{ paddingTop: '50px' }}>데이터를 엮고 있습니다...</div>;

  const parsedDesc = extractMeta(work.description || "");
  const coverExt = parsedDesc.meta.coverExt;
  const charExt = parsedDesc.meta.charExt || "png";
  const coverUrl = `/img/cover/${encodeURIComponent(work.title + "." + (coverExt || 'png'))}`;

  const activePage = pageId ? wikiPages.find(p => String(p.id) === pageId) : null;

  // 캐릭터 그룹핑 (선택된 기준에 따라 자동 분류 및 숨김태그(*) 제거)
  const groupedChars = {};
  characters.forEach(c => {
    const tags = String(c[groupCriteria] || "미분류").split(',').map(s => s.trim().replace(/^\*/, '')).filter(Boolean);
    if (tags.length === 0) tags.push("미분류");
    tags.forEach(tag => {
      if (!groupedChars[tag]) groupedChars[tag] = [];
      groupedChars[tag].push(c);
    });
  });

  const activeChar = characters.find(c => c.id === activeCharId);

  return (
    <div className="main-content-wrap">
      <div className={`fixed-container ${styles.wikiContainer}`}>
        
        {/* 📄 [모드 1] 하위 위키 문서 뷰어 모드 */}
        {activePage ? (
          <div className={styles.mainArea} style={{ background: 'var(--surface-color)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, color: 'var(--primary-color)' }}>{activePage.title}</h1>
              <button className="wiki-btn" style={{ background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }} onClick={() => navigate(`/edit?type=page&action=edit&workId=${workId}&id=${activePage.id}`)}>✏️ 수정</button>
            </div>
            <MarkdownRenderer rawText={activePage.content} onNodeClick={handleNodeClick} />
          </div>
        ) : (
          
          /* 📚 [모드 2] 최상위 작품 메인 뷰어 모드 */
          <>
            {coverExt ? (
              <div 
                className={styles.workHeroBanner} 
                style={{ backgroundImage: `url('${coverUrl}')`, backgroundPosition: `50% ${coverY}%`, cursor: isCoverEdit ? (isCoverDragging ? 'grabbing' : 'grab') : 'default' }}
                onMouseDown={handleCoverMouseDown} onMouseMove={handleCoverMouseMove} onMouseUp={handleCoverMouseUp} onMouseLeave={handleCoverMouseUp}
              >
                <div className={styles.heroOverlay}></div>
                <h1 className={styles.heroTitle}>{work.title}</h1>
                <div style={{ position: 'absolute', bottom: '20px', right: '30px', zIndex: 10, display: 'flex', gap: '10px' }}>
                  {!isCoverEdit ? (
                    <button className="wiki-btn" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }} onClick={() => setIsCoverEdit(true)}>🖼️ 표지 위치 변경</button>
                  ) : (
                    <>
                      <button className="wiki-btn" style={{ background: '#10b981' }} onClick={saveCoverY}>💾 저장</button>
                      <button className="wiki-btn" style={{ background: '#e53e3e' }} onClick={() => setIsCoverEdit(false)}>✖ 취소</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.wikiTitleArea}>
                <h1 className={styles.wikiTitle}>{work.title}</h1>
                <button className="wiki-btn" onClick={() => navigate(`/edit?type=work&action=edit&id=${work.id}`)}>✏️ 작품 편집</button>
              </div>
            )}

            <div className={styles.wikiCategory}>
              <strong>분류: </strong>
              {work.genre && work.genre.split(',').map(g => g.trim() && <span key={g} className={styles.tagItem}>{g}</span>)}
            </div>

            <div className={styles.contentWrapper}>
              <main className={styles.mainArea}>
                
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>1. 개요</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>제작자: <strong>{work.creator || '미상'}</strong> | 상태: <strong>[{work.status || '진행 중'}]</strong></p>
                  {parsedDesc.meta.overview && <MarkdownRenderer rawText={parsedDesc.meta.overview} onNodeClick={handleNodeClick} />}
                </section>

                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span>2. 세계관 설정</span>
                    <button className="wiki-btn" onClick={() => navigate(`/edit?type=work&action=edit&id=${work.id}`)}>✏️ 편집</button>
                  </h2>
                  <MarkdownRenderer rawText={parsedDesc.clean} onNodeClick={handleNodeClick} />
                </section>

                {/* 캐릭터 목록 (자동 정렬 그리드 뷰) */}
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span>3. 등장인물 목록</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select value={groupCriteria} onChange={e => setGroupCriteria(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}>
                        <option value="관계">관계별</option><option value="소속">소속별</option><option value="등급">등급별</option><option value="종족">종족별</option><option value="성별">성별별</option>
                      </select>
                      <button className="wiki-btn" onClick={() => navigate(`/edit?type=char&action=new&workId=${workId}`)}>+ 새 캐릭터 추가</button>
                    </div>
                  </h2>
                  
                  {Object.keys(groupedChars).sort().map(gName => (
                    <div key={gName} style={{ marginBottom: '30px' }}>
                      <h3 style={{ color: 'var(--primary-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '5px', marginBottom: '15px' }}>
                        {gName} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>({groupedChars[gName].length})</span>
                      </h3>
                      <div className={styles.charGrid}>
                        {groupedChars[gName].map(c => (
                          <div key={c.id} className={styles.charCard} style={{ borderTop: `4px solid ${c.themeColor || 'var(--primary-color)'}`, backgroundColor: activeCharId === c.id ? 'rgba(59,91,219,0.05)' : '' }} onClick={() => setActiveCharId(activeCharId === c.id ? null : c.id)}>
                            <div className={styles.charImgWrap}>
                              <img src={`/img/character/${encodeURIComponent(work.title + "_" + c.name + "." + charExt)}`} style={{ objectPosition: `50% ${c.cardImgY ?? 50}%` }} onError={(e) => e.target.style.display = 'none'} alt={c.name} />
                            </div>
                            <h4 style={{ margin: '0 0 5px 0', color: c.themeColor || 'var(--primary-color)' }}>{c.name}</h4>
                            {c['부제목'] && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c['부제목']}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              </main>

              {/* 우측 인포박스 팝업 */}
              <aside className={styles.asideArea}>
                {activeChar && (
                  <div className={styles.infobox}>
                    <h3 className={styles.infoTitle} style={{ backgroundColor: activeChar.themeColor || 'var(--primary-color)' }}>
                      {activeChar.name}
                      {activeChar['부제목'] && <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '5px' }}>{activeChar['부제목']}</div>}
                    </h3>
                    <div className={styles.infoImg}>
                      <img src={`/img/character/${encodeURIComponent(work.title + "_" + activeChar.name + "." + charExt)}`} onError={(e) => e.target.style.display = 'none'} alt={activeChar.name} />
                    </div>
                    <table className={styles.infoTable}>
                      <tbody>
                        {['나이', '성별', '종족', '소속', '등급', '관계'].map(k => activeChar[k] && (
                          <tr key={k}><th>{k}</th><td>{String(activeChar[k]).replace(/^\*/, '')}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                      <button className="theme-btn" style={{ flex: 1, borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }} onClick={() => navigate(`/edit?type=char&action=edit&workId=${workId}&id=${activeChar.id}`)}>수정</button>
                      <button className="theme-btn" style={{ flex: 1, borderColor: '#e53e3e', color: '#e53e3e' }} onClick={async () => {
                        if (window.confirm("캐릭터를 삭제하시겠습니까?")) {
                          await api.delete(`/api/characters/${activeChar.id}`);
                          setCharacters(characters.filter(c => c.id !== activeChar.id));
                          setActiveCharId(null);
                        }
                      }}>삭제</button>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkDetailPage;
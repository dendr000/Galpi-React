import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from './WorkDetail.module.css';
import { extractMeta } from '../../utils/markdownParser';
import MarkdownRenderer from '../../components/macro/MarkdownRenderer';
import CharacterInfobox from './CharacterInfobox';

const WorkDetailPage = () => {
  const { workId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [work, setWork] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [tocList, setTocList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activePageId = searchParams.get('pageId') ? parseInt(searchParams.get('pageId'), 10) : null;
  const [activeCharId, setActiveCharId] = useState(null);
  const [groupCriteria, setGroupCriteria] = useState(() => localStorage.getItem(`galpi-char-group-${workId}`) || '관계');
  
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [coverY, setCoverY] = useState(50);
  
  // ★ 하위 문서 트리용 상태
  const [expandedToc, setExpandedToc] = useState({});

  // ★ 드래그 앤 드롭 상태 관리를 위한 Ref 및 동기화 추가
  const draggedCharRef = useRef(null);
  const charactersRef = useRef([]);
  const [cardVariants, setCardVariants] = useState({}); 
  
  // ★ 일괄 이미지 위치 조정 모달용 상태
  const [isBatchImgModalOpen, setIsBatchImgModalOpen] = useState(false);
  const [batchImgY, setBatchImgY] = useState(50);

  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [wRes, cRes, pRes] = await Promise.all([
          api.get(`/api/works/${workId}`),
          api.get(`/api/characters?workId=${workId}`),
          api.get(`/api/wikipages?workId=${workId}`)
        ]);

        const workData = wRes.data;
        setWork(workData);
        setCharacters(cRes.data.filter(c => !c.isTrash));
        
        const sortedPages = pRes.data.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
        setTocList(sortedPages);

        const parsedDesc = extractMeta(workData.description || "");
        if (parsedDesc.meta.coverY !== undefined) setCoverY(parsedDesc.meta.coverY);
        
        // 트리 자동 전개 로직
        const newExpanded = {};
        sortedPages.forEach(p => { if (sortedPages.some(child => child.parentId === p.id)) newExpanded[p.id] = true; });
        setExpandedToc(newExpanded);

      } catch (err) {
        setError("작품 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workId]);

  useEffect(() => {
    localStorage.setItem(`galpi-char-group-${workId}`, groupCriteria);
  }, [groupCriteria, workId]);

  const handleCharDragStart = (e, char, groupName) => {
    draggedCharRef.current = { char, groupName };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', char.id);
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleCharDragOver = (e, targetChar, groupName) => {
    e.preventDefault(); 
    const dragged = draggedCharRef.current;
    if (!dragged || dragged.char.id === targetChar.id || dragged.groupName !== groupName) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;

    setCharacters(prev => {
      const getTags = (c) => {
        let dp = {};
        try { if (typeof c.dynamicProperties === 'string') dp = JSON.parse(c.dynamicProperties); else if (typeof c._rawDynamic === 'string') dp = JSON.parse(c._rawDynamic); } catch(err) {}
        const mergedData = { ...c, ...dp };
        const rawVal = mergedData[groupCriteria] || "미분류";
        const tags = String(rawVal).split(',').map(s => s.trim()).filter(Boolean);
        let validTags = tags.filter(t => !t.startsWith('*'));
        return validTags.length === 0 ? ["미분류"] : validTags;
      };

      const inGroup = prev.filter(c => getTags(c).includes(groupName)).sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      const draggedIdx = inGroup.findIndex(c => c.id === dragged.char.id);
      const targetIdx = inGroup.findIndex(c => c.id === targetChar.id);
      if (draggedIdx === -1 || targetIdx === -1) return prev;

      if (draggedIdx < targetIdx && e.clientX < midX) return prev;
      if (draggedIdx > targetIdx && e.clientX > midX) return prev;

      const newGroup = [...inGroup];
      const [removed] = newGroup.splice(draggedIdx, 1);
      newGroup.splice(targetIdx, 0, removed);

      const orderMap = new Map();
      newGroup.forEach((c, idx) => orderMap.set(c.id, idx));

      let changed = false;
      const nextState = prev.map(c => {
        if (orderMap.has(c.id) && c.sortOrder !== orderMap.get(c.id)) {
          changed = true;
          return { ...c, sortOrder: orderMap.get(c.id) };
        }
        return c;
      });
      return changed ? nextState : prev;
    });
  };

  const handleCharDragEnd = async (e, groupName) => {
    e.target.style.opacity = '1';
    const dragged = draggedCharRef.current;
    draggedCharRef.current = null;
    if (!dragged) return;

    const getTags = (c) => {
      let dp = {};
      try { if (typeof c.dynamicProperties === 'string') dp = JSON.parse(c.dynamicProperties); else if (typeof c._rawDynamic === 'string') dp = JSON.parse(c._rawDynamic); } catch(err) {}
      const mergedData = { ...c, ...dp };
      const rawVal = mergedData[groupCriteria] || "미분류";
      const tags = String(rawVal).split(',').map(s => s.trim()).filter(Boolean);
      let validTags = tags.filter(t => !t.startsWith('*'));
      return validTags.length === 0 ? ["미분류"] : validTags;
    };

    const inGroup = charactersRef.current.filter(c => getTags(c).includes(groupName));
    const promises = [];

    inGroup.forEach(c => {
      let dp = {};
      try { 
        if (c.dynamicProperties) dp = JSON.parse(c.dynamicProperties);
        else if (c._rawDynamic) dp = JSON.parse(c._rawDynamic); 
      } catch(err){}
      
      if (dp.sortOrder !== c.sortOrder) {
        dp.sortOrder = c.sortOrder;
        const newDynamic = JSON.stringify(dp);
        const payload = { ...c, dynamicProperties: newDynamic, _rawDynamic: newDynamic };
        promises.push(api.put(`/api/characters/${c.id}`, payload));
      }
    });

    if (promises.length > 0) {
      try { await Promise.all(promises); } catch (err) {}
    }
  };

  const handleCoverMouseDown = (e) => {
    setIsCoverDragging(true);
    setDragStartY(e.clientY);
  };

  const handleCoverMouseMove = (e) => {
    if (!isCoverDragging) return;
    const dy = e.clientY - dragStartY;
    setDragStartY(e.clientY);
    setCoverY(prev => {
      let next = prev - (dy * 0.2);
      if (next < 0) next = 0;
      if (next > 100) next = 100;
      return next;
    });
  };

  const handleCoverMouseUp = () => setIsCoverDragging(false);

  const saveCoverPosition = async () => {
    if (!work) return;
    try {
      const parsedDesc = extractMeta(work.description || "");
      parsedDesc.meta.coverY = Math.round(coverY);
      
      const newDesc = `[META_DATA:${JSON.stringify(parsedDesc.meta)}]\n${parsedDesc.clean}`;
      await api.put(`/api/works/${workId}`, { ...work, description: newDesc });
      setWork({ ...work, description: newDesc });
      alert("커버 위치가 저장되었습니다.");
    } catch (e) {
      alert("커버 위치 저장에 실패했습니다.");
    }
  };

  // ★ 하위 문서 트리 렌더링 함수
  const toggleToc = (e, id) => {
    e.stopPropagation();
    setExpandedToc(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const renderTocTree = (parentId = null, depth = 0) => {
    const children = tocList.filter(p => p.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', paddingLeft: depth === 0 ? '0' : '15px', margin: '5px 0' }}>
        {children.map(page => {
          const hasChild = tocList.some(p => p.parentId === page.id);
          const isExpanded = expandedToc[page.id];
          const iconSrc = hasChild 
            ? (isExpanded ? '/img/svg/folder-open.svg' : '/img/svg/folder-close.svg') 
            : '/img/svg/document.svg';

          return (
            <li key={page.id} style={{ marginBottom: '5px' }}>
              <div 
                className={styles.tocItem} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px', background: activePageId === page.id ? 'var(--table-bg-alt)' : 'transparent', borderRadius: '6px', color: activePageId === page.id ? 'var(--primary-color)' : 'var(--text-primary)', fontWeight: activePageId === page.id ? 'bold' : 'normal' }}
                onClick={() => navigate(`/work/${workId}?pageId=${page.id}`)}
              >
                <img 
                  src={iconSrc} 
                  style={{ width: '16px', height: '16px', cursor: hasChild ? 'pointer' : 'default', opacity: 0.7 }} 
                  onClick={(e) => { if (hasChild) toggleToc(e, page.id); }}
                  alt="icon"
                />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.title}</span>
              </div>
              {hasChild && isExpanded && renderTocTree(page.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (loading || !work) return <div style={{ padding: '50px', textAlign: 'center', fontWeight: 'bold' }}>데이터를 불러오는 중입니다...</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: '#e53e3e', fontWeight: 'bold' }}>{error}</div>;

  const parsedDesc = extractMeta(work.description || "");
  const coverExt = parsedDesc.meta.coverExt;
  const charExt = parsedDesc.meta.charExt || "png";
  const imgVariants = parsedDesc.meta.imgVariants || [];
  const fullVariants = ["", ...imgVariants.filter(v => v.trim() !== "")];
  const coverUrl = `/img/cover/${encodeURIComponent(work.title + "." + (coverExt || 'png'))}`;

  const childPages = tocList.filter(p => p.parentId === null);
  const activePage = activePageId ? tocList.find(p => p.id === activePageId) : null;

  let charSectionNum = 3;
  if (!parsedDesc.meta.overview) charSectionNum -= 1;
  if (!parsedDesc.clean) charSectionNum -= 1;

  // ★ 등장인물 그룹 분류 로직 강화
  const groupedChars = {};
  characters.forEach(c => {
    let dp = {};
    try {
      if (typeof c.dynamicProperties === 'string') dp = JSON.parse(c.dynamicProperties);
      else if (typeof c._rawDynamic === 'string') dp = JSON.parse(c._rawDynamic);
    } catch(err) {}

    const mergedData = { ...c, ...dp };
    const rawVal = mergedData[groupCriteria] || "미분류";
    
    const tags = String(rawVal).split(',').map(s => s.trim()).filter(Boolean);
    let validTags = tags.filter(t => !t.startsWith('*'));
    if (validTags.length === 0) validTags = ["미분류"]; 
    
    validTags.forEach(tag => {
      if (!groupedChars[tag]) groupedChars[tag] = [];
      if (!groupedChars[tag].some(exist => exist.id === c.id)) groupedChars[tag].push(c);
    });
  });

  Object.keys(groupedChars).forEach(k => {
    groupedChars[k].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  });

  // ★ 메타데이터에 등록된 그룹 정렬 순서(_groupOrder)를 추출하여 키 배열 렌더링 순서 보정
  const groupOrderArray = parsedDesc.meta._groupOrder?.[groupCriteria] || [];
  const sortedGroupNames = Object.keys(groupedChars).sort((a, b) => {
    let idxA = groupOrderArray.indexOf(a);
    let idxB = groupOrderArray.indexOf(b);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

  const activeChar = characters.find(c => c.id === activeCharId);

  return (
    <div className={styles.workDetailLayout}>
      <div 
        className={styles.coverSection} 
        onMouseMove={handleCoverMouseMove} 
        onMouseUp={handleCoverMouseUp} 
        onMouseLeave={handleCoverMouseUp}
        style={{ cursor: isCoverDragging ? 'grabbing' : 'default' }}
      >
        {coverExt ? (
          <img 
            src={coverUrl} 
            alt="Cover" 
            className={styles.coverImage} 
            style={{ objectPosition: `50% ${coverY}%`, pointerEvents: 'none' }}
            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-color), #748ffc)' }}></div>
        )}
        <div className={styles.coverOverlay}></div>
        
        <div className={styles.coverHeader}>
          <div className={styles.coverHeaderLeft}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>⬅ 돌아가기</button>
            <div className={styles.coverTitleBlock}>
              <h1 className={styles.workTitle}>{work.title}</h1>
              <div className={styles.workMetaTags}>
                <span className={styles.tag}>{work.creator || "작자 미상"}</span>
                {work.genre && work.genre.split(',').map((g, i) => <span key={i} className={styles.tag}>{g.trim()}</span>)}
                <span className={`${styles.tag} ${styles.statusTag}`}>{work.status || "진행 전"}</span>
              </div>
            </div>
          </div>
          <div className={styles.coverHeaderRight}>
            <button className="wiki-btn" title="커버 이미지의 기준점을 마우스 드래그로 조정한 뒤 저장하세요" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: isCoverDragging ? 'grabbing' : 'grab' }} onMouseDown={handleCoverMouseDown}>↕ 커버 위치 조정</button>
            {coverY !== (parsedDesc.meta.coverY ?? 50) && (
              <button className="wiki-btn" style={{ background: 'var(--primary-color)', color: 'white', border: 'none', animation: 'fadeIn 0.3s ease' }} onClick={saveCoverPosition}>위치 저장</button>
            )}
            <button className="wiki-btn" style={{ background: 'var(--surface-color)', color: 'var(--text-primary)' }} onClick={() => navigate(`/edit?type=work&action=edit&id=${workId}`)}>⚙️ 작품 설정</button>
          </div>
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className="fixed-container" style={{ display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          
          <nav className={styles.wikiSidebar}>
            <div className={styles.sidebarSticky}>
              <div className={styles.sidebarBlock}>
                <h3 className={styles.sidebarTitle}>대분류 목차</h3>
                <ul className={styles.sidebarNavList}>
                  <li className={!activePageId ? styles.active : ''} onClick={() => navigate(`/work/${workId}`)}>🏠 작품 설정 홈</li>
                  {tocList.filter(p => p.parentId === null).map(page => (
                    <li key={page.id} className={activePageId === page.id ? styles.active : ''} onClick={() => navigate(`/work/${workId}?pageId=${page.id}`)}>📄 {page.title}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.sidebarBlock}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 className={styles.sidebarTitle} style={{ margin: 0 }}>하위 문서 구조</h3>
                  <button className="wiki-btn" style={{ padding: '2px 6px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={() => navigate(`/edit?type=page&action=new&workId=${workId}`)}>+ 추가</button>
                </div>
                <div className={styles.tocList}>
                  {renderTocTree(null, 0)}
                </div>
              </div>
            </div>
          </nav>
          
          <main className={styles.wikiMain}>
            
            {activePage ? (
              <section className={styles.wikiSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionHeaderTitle} style={{ color: 'var(--primary-color)' }}>{activePage.title}</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => navigate(`/edit?type=page&action=edit&workId=${workId}&id=${activePage.id}`)}>✏️ 문서 편집</button>
                    <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px', background: 'transparent', color: '#e53e3e', border: '1px dashed #e53e3e' }} onClick={async () => {
                      if (window.confirm("⚠️ 경고: 이 하위 문서를 영구 삭제하시겠습니까?")) {
                        try {
                          await api.delete(`/api/wikipages/${activePage.id}`);
                          navigate(`/work/${workId}`);
                        } catch(e) { alert("삭제 실패"); }
                      }
                    }}>🗑️ 삭제</button>
                  </div>
                </div>
                <MarkdownRenderer rawText={activePage.content} />
              </section>
            ) : (
              <>
                {parsedDesc.meta.overview && (
                  <section id="sec-1" className={styles.wikiSection}>
                    <h2 className="md-h1">1. 개요</h2>
                    <MarkdownRenderer rawText={parsedDesc.meta.overview} />
                  </section>
                )}
                
                {parsedDesc.clean && (
                  <section id="sec-2" className={styles.wikiSection}>
                    <h2 className="md-h1">{parsedDesc.meta.overview ? '2' : '1'}. 세계관 설정</h2>
                    <MarkdownRenderer rawText={parsedDesc.clean} startH1={parsedDesc.meta.overview ? 3 : 2} />
                  </section>
                )}
              </>
            )}

            {!activePage && (
              <section id="sec-wiki-pages" className={styles.wikiSection}>
                <div className={styles.sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 id="sec-subpages" className={`${styles.sectionHeaderTitle} auto-toc-target`}>🗂️ 하위 문서 목록</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{childPages.length}개</span>
                  </div>
                  <button className="wiki-btn" style={{ background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '4px 10px', fontSize: '13px' }} onClick={() => navigate(`/edit?type=page&action=new&workId=${workId}`)}>+ 새 문서 추가</button>
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
            )}

            {!activePage && (
              <section id="sec-3" className={styles.wikiSection}>
                <div className={styles.sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 id="sec-characters" className={`${styles.sectionHeaderTitle} auto-toc-target`}>{charSectionNum}. 등장인물 목록</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <label style={{ fontWeight: 'bold' }}>분류 기준:</label>
                      <select value={groupCriteria} onChange={e => setGroupCriteria(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)', background: 'var(--surface-color)', outline: 'none', cursor: 'pointer' }}>
                        <option value="관계">관계별</option><option value="소속">소속별</option><option value="등급">등급별</option><option value="종족">종족별</option><option value="성별">성별별</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="wiki-btn" title="일괄 이미지 위치 조정" style={{ padding: '4px 10px', fontSize: '13px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={() => setIsBatchImgModalOpen(true)}>🖼️</button>
                    <button className="wiki-btn" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => navigate(`/edit?type=char&action=new&workId=${workId}`)}>+ 새 캐릭터 추가</button>
                  </div>
                </div>
                <div>
                  {sortedGroupNames.map(gName => (
                    <div key={gName} className={styles.relationGroup}>
                      <h3 className={styles.relationHeader}>{gName} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({groupedChars[gName].length})</span></h3>
                      
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
                                  if (fullVariants.length > 1) {
                                    setCardVariants(prev => ({ ...prev, [c.id]: ((prev[c.id] || 0) + 1) % fullVariants.length }));
                                  }
                                } else {
                                  setActiveCharId(activeCharId === c.id ? null : c.id);
                                }
                              }}
                              draggable="true"
                              onDragStart={(e) => handleCharDragStart(e, c, gName)}
                              onDragOver={(e) => handleCharDragOver(e, c, gName)}
                              onDrop={(e) => e.preventDefault()}
                              onDragEnd={(e) => handleCharDragEnd(e, gName)}
                            >
                              <div className={styles.cardImgWrap}>
                                <img src={cardImgSrc} style={{ objectPosition: `50% ${c.cardImgY ?? 50}%` }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'var(--table-bg-alt)'; }} alt={c.name} />
                              </div>
                              <h4 style={{ margin: '0 0 5px 0', color: c.themeColor || 'var(--primary-color)', fontSize: '15px', fontWeight: 900 }}>{c.name}</h4>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!activePage && activeChar && (
              <section id="character-detail-section" className={styles.wikiSection}>
                <div className={styles.sectionHeader}>
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
                        style={{ borderColor: tc, color: isActive ? 'white' : tc, backgroundColor: isActive ? tc : 'transparent' }}
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
            <CharacterInfobox char={activeChar} workId={workId} workTitle={work.title} charExt={charExt} imgVariants={imgVariants} setCharacters={setCharacters} setActiveCharId={setActiveCharId} />
          </aside>
        </div>
      </div>

      {isBatchImgModalOpen && characters.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onClick={() => setIsBatchImgModalOpen(false)}>
          <div style={{ background: 'var(--surface-color)', width: '350px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px 20px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--primary-color)' }}>🖼️ 캐릭터 썸네일 일괄 조정</h3>
              <button style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsBatchImgModalOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '200px', height: '260px', background: 'var(--bg-color)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                <img 
                  src={`/img/character/${encodeURIComponent(work.title + "_" + characters[0].name + "." + charExt)}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${batchImgY}%` }} 
                  onError={(e) => e.target.style.display = 'none'} 
                  alt="미리보기"
                />
              </div>
              <input 
                type="range" min="0" max="100" value={batchImgY} 
                onChange={(e) => setBatchImgY(e.target.value)} 
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Y축 위치: {batchImgY}%</span>
              <p style={{ margin: 0, fontSize: '12px', color: '#e53e3e', textAlign: 'center', lineHeight: 1.4 }}>
                저장 시 이 작품의 <strong>모든 캐릭터</strong> 썸네일 위치가<br/>선택한 값으로 일괄 변경됩니다.
              </p>
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
              <button className="wiki-btn" style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={() => setIsBatchImgModalOpen(false)}>취소</button>
              <button className="wiki-btn" style={{ flex: 2, padding: '10px', background: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={async () => {
                try {
                  const promises = characters.map(c => {
                    let dp = {};
                    try { dp = JSON.parse(c.dynamicProperties || c._rawDynamic || "{}"); } catch(err){}
                    dp.cardImgY = parseInt(batchImgY, 10);
                    const newDynamic = JSON.stringify(dp);
                    return api.put(`/api/characters/${c.id}`, { ...c, dynamicProperties: newDynamic, _rawDynamic: newDynamic });
                  });
                  await Promise.all(promises);
                  
                  setCharacters(prev => prev.map(c => ({ ...c, cardImgY: parseInt(batchImgY, 10) })));
                  setIsBatchImgModalOpen(false);
                  alert("일괄 변경이 완료되었습니다.");
                } catch(e) {
                  alert("변경 중 오류가 발생했습니다.");
                }
              }}>일괄 저장 적용</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkDetailPage;

const InlineCategoryForm = ({ work, workId, setWork }) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const submitInlineCat = async (keepOpen = false) => {
    const val = inputValue.trim();
    if (!val) {
      setIsInputVisible(false);
      return;
    }

    const gs = work.genre ? work.genre.split(',').map(g => g.trim()).filter(g => g !== "") : [];
    
    if (!gs.includes(val)) {
      gs.push(val);
      const newGenre = gs.join(',');
      try {
        await api.put(`/api/works/${workId}`, { ...work, genre: newGenre });
        setWork(prev => ({ ...prev, genre: newGenre }));
        if (keepOpen) {
          setInputValue('');
        } else {
          setIsInputVisible(false);
          setInputValue('');
        }
      } catch (err) {
        alert("분류 추가 실패");
      }
    } else {
      if (keepOpen) setInputValue('');
      else setIsInputVisible(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitInlineCat(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      submitInlineCat(true);
    }
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '5px' }}>
      {!isInputVisible ? (
        <button 
          className="wiki-btn" 
          style={{ padding: '2px 10px', fontSize: '12px', background: 'transparent', color: 'var(--primary-color)', border: '1px dashed var(--primary-color)', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }} 
          onClick={() => setIsInputVisible(true)}
        >
          + 분류 추가
        </button>
      ) : (
        <span style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <input 
            type="text" 
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '2px 8px', fontSize: '12px', border: '1px solid var(--primary-color)', borderRadius: '12px', outline: 'none', width: '80px', background: 'var(--surface-color)', color: 'var(--text-primary)' }} 
            placeholder="입력" 
          />
          <button 
            onClick={() => submitInlineCat(false)} 
            style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
          >확인</button>
          <button 
            onClick={() => { setIsInputVisible(false); setInputValue(''); }} 
            style={{ padding: '2px 8px', fontSize: '12px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
          >취소</button>
        </span>
      )}
    </span>
  );
};
// 파일 위치: src/pages/EditorPage/EditorPage.jsx
// 기능 요약: 이미지 바리에이션 제어 구조, 서식 단축 툴바 컴포넌트 및 프리뷰 메타데이터 실시간 동기화 스튜디오 엔진 (v2.0.0)

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosCore';
import styles from './EditorPage.module.css';
import { extractMeta } from '../../utils/markdownParser';
import MarkdownRenderer from '../../domains/macro/MarkdownRenderer';
import EditorSearch from './EditorSearch';
import MacroToolbar from '../../domains/macro/MacroToolbar';

const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL 쿼리 파라미터 파싱 및 데이터 바인딩 기반 정의
  const docType = searchParams.get('type') || 'work';
  const docAction = searchParams.get('action') || 'new';
  const targetId = searchParams.get('id');
  const targetWorkId = searchParams.get('workId');

  console.log(`[EditorPage] 시스템 파라미터 감지 완료 - 타입: ${docType}, 액션: ${docAction}, ID: ${targetId}`);

  // 화면 처리 구역 제어 상태 변수 그룹화
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  
  // 실시간 텍스트 제어 동기화 원장 스토리지
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [overviewText, setOverviewText] = useState(''); 
  
  // 작품(세계관) 구조용 세부 메타 스펙 속성 데이터 정의
  const [workMeta, setWorkMeta] = useState({
    creator: '', genre: '', status: '진행 전', alias: '', coverExt: '', charExt: 'png', groupOrderStr: '', imgVariants: [''], originalMeta: {}
  });

  // 등장인물 전용 구조화 컴포넌트 변수
  const [charProps, setCharProps] = useState([]);
  const [themeColor, setThemeColor] = useState('#3b5bdb');
  const [cardLabels, setCardLabels] = useState({ label1: '나이', label2: '성격' });
  const [workContext, setWorkContext] = useState(null);

  const editorRef = useRef(null);

  const badgeText = 
    docType === 'work' ? (docAction === 'new' ? '📚 새 작품 등록' : '📚 작품 설정 편집') : 
    docType === 'page' ? (docAction === 'new' ? '📄 새 위키 문서' : '📄 문서 편집') :
    (docAction === 'new' ? '👤 새 캐릭터 추가' : '👤 캐릭터 상세 편집');

  // 컴포넌트 마운트 시 데이터베이스 스캔 프로세스 가동
  useEffect(() => {
    const fetchData = async () => {
      console.log(`[EditorPage] REST API 비동기 원장 호출 데이터 로딩 시작.`);
      setLoading(true);
      try {
        if (docType === 'work') {
          if (docAction === 'edit' && targetId) {
            console.log(`[EditorPage] 작품 수정 모드 진입. 대상 ID: ${targetId}`);
            const res = await api.get(`/api/works/${targetId}`);
            const data = res.data;
            setTitle(data.title || '');
            
            const parsed = extractMeta(data.description);
            setRawText(parsed.clean);
            setOverviewText(parsed.meta.overview || '');
            
            let groupOrderStr = "";
            if (parsed.meta._groupOrder) {
              for (let k in parsed.meta._groupOrder) {
                groupOrderStr += `${k}: ${parsed.meta._groupOrder[k].join(', ')}\n`;
              }
            }

            setWorkMeta({
              creator: data.creator || '',
              genre: data.genre || '',
              status: data.status || '진행 전',
              alias: parsed.meta.alias || '',
              coverExt: parsed.meta.coverExt || '',
              charExt: parsed.meta.charExt || 'png',
              groupOrderStr: groupOrderStr,
              imgVariants: parsed.meta.imgVariants?.length > 0 ? parsed.meta.imgVariants : [''],
              originalMeta: parsed.meta // ★ 기존 데이터(coverY 등) 유실 방지 백업
            });
            console.log(`[EditorPage] 작품 메타데이터 구조체 복원 파싱 성공.`);
          }
        } 
        else if (docType === 'page') {
          if (docAction === 'edit' && targetId) {
            console.log(`[EditorPage] 위키 하위문서 수정 모드 데이터 로드 진입. ID: ${targetId}`);
            const res = await api.get(`/api/wikipages/${targetId}`);
            setTitle(res.data.title || '');
            setRawText(res.data.content || '');
          }
        } 
        else if (docType === 'char') {
          if (targetWorkId) {
            const wRes = await api.get(`/api/works/${targetWorkId}`);
            setWorkContext(wRes.data);
          }
          if (docAction === 'edit' && targetId) {
            console.log(`[EditorPage] 캐릭터 정보 수정 구역 분석 개시. ID: ${targetId}`);
            const res = await api.get(`/api/characters?workId=${targetWorkId}`);
            const char = res.data.find(c => String(c.id) === String(targetId));
            if (char) {
              setTitle(char.name || '');
              let dp = {};
              try { dp = JSON.parse(char.dynamicProperties || char._rawDynamic || "{}"); } catch(e){}
              
              setThemeColor(dp.themeColor || char.themeColor || '#3b5bdb');
              setCardLabels({ label1: dp._cardLabel1 || '나이', label2: dp._cardLabel2 || '성격' });
              setRawText(dp.pageBody?.rawText || '');

              const merged = { ...char, ...dp };
              if (char.age) merged['나이'] = char.age;
              if (char.birthday) merged['생일'] = char.birthday;
              if (char.gender) merged['성별'] = char.gender;
              if (char.species) merged['종족'] = char.species;

              const pOrder = dp._propOrder || [];
              const extractedProps = [];
              const renderKeys = new Set();

              pOrder.forEach(k => {
                if (merged[k] !== undefined && !k.startsWith('_') && !["age","birthday","gender","species","id","name","imageCode","pageBody","themeColor","cardImgY","dynamicProperties","작품명","제작자","sortOrder","workId"].includes(k)) {
                  extractedProps.push({ key: k, val: merged[k] });
                  renderKeys.add(k);
                }
              });

              for (const k in merged) {
                if (!renderKeys.has(k) && !k.startsWith('_') && !["age","birthday","gender","species","id","name","imageCode","pageBody","themeColor","cardImgY","dynamicProperties","작품명","제작자","sortOrder","workId"].includes(k)) {
                  extractedProps.push({ key: k, val: merged[k] });
                }
              }
              
              if (!extractedProps.some(p => p.key === '부제목')) {
                extractedProps.unshift({ key: '부제목', val: '' });
              } else {
                const subIdx = extractedProps.findIndex(p => p.key === '부제목');
                const subProp = extractedProps.splice(subIdx, 1)[0];
                extractedProps.unshift(subProp);
              }

              setCharProps(extractedProps);
              console.log(`[EditorPage] 캐릭터 특성 속성 맵 바인딩 완료.`);
            }
          } else {
            setCharProps([
              { key: '부제목', val: '' },
              { key: '나이', val: '' },
              { key: '성별', val: '여성' },
              { key: '종족', val: '인간(人間)' },
              { key: '관계', val: '일반' }
            ]);
          }
        }
      } catch (err) {
        console.error(`[EditorPage] 원장 서버 패치 에러 발생:`, err);
        alert("데이터 로드 중 통신 장애가 감지되었습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [docType, docAction, targetId, targetWorkId]);

  // 상단 뒤로가기 전용 안전 라우터 제어 컨텍스트 함수
  const handleGoBack = () => {
    console.log("[EditorPage] 사용자 취소 스택 감지. 안전 뒤로가기 실행.");
    if (targetWorkId && targetWorkId !== 'null') {
      if (docType === 'page' && targetId) navigate(`/work/${targetWorkId}?pageId=${targetId}`);
      else navigate(`/work/${targetWorkId}`);
    } else if (targetId && docType === 'work') {
      navigate(`/work/${targetId}`);
    } else {
      navigate(-1);
    }
  };

  // 👗 이미지 바리에이션 필드 조작 함수
  const handleAddVariant = () => {
    console.log("[EditorPage] 복장 바리에이션 필드 폼 추가 동작.");
    setWorkMeta(prev => ({
      ...prev,
      imgVariants: [...prev.imgVariants, '']
    }));
  };

  const handleVariantChange = (index, value) => {
    console.log(`[EditorPage] 바리에이션 변환 데이터 변경 인덱스[${index}]: ${value}`);
    const newVariants = [...workMeta.imgVariants];
    newVariants[index] = value;
    setWorkMeta(prev => ({ ...prev, imgVariants: newVariants }));
  };

  const handleRemoveVariant = (index) => {
    console.log(`[EditorPage] 바리에이션 삭제 동작 실행 인덱스: ${index}`);
    const newVariants = [...workMeta.imgVariants];
    newVariants.splice(index, 1);
    setWorkMeta(prev => ({ ...prev, imgVariants: newVariants.length > 0 ? newVariants : [''] }));
  };

  // ✏️ 텍스트 서식 매크로 삽입 제어 공통 엔진 함수
  const applyTextFormat = (prefix, suffix) => {
    console.log(`[EditorPage] 서식 매크로 빌더 주입 함수 작동: [${prefix}][${suffix}]`);
    const textarea = editorRef.current;
    if (!textarea) return;

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const before = text.substring(Math.max(0, start - prefix.length), start);
    const after = text.substring(end, end + suffix.length);

    let isUnwrap = (before === prefix && after === suffix);
    let newInsertedText = isUnwrap ? selected : prefix + selected + suffix;

    setRawText(text.substring(0, isUnwrap ? start - prefix.length : start) + newInsertedText + text.substring(isUnwrap ? end + suffix.length : end));

    setTimeout(() => {
      textarea.focus();
      if (isUnwrap) {
        textarea.setSelectionRange(start - prefix.length, start - prefix.length + selected.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }
    }, 0);
  };

  // 🔠 가나다순 선택 문장 일괄 정렬 알고리즘 함수
  const sortSelectedLines = () => {
    console.log("[EditorPage] 가나다 자동 라인 정렬 엔진 가동.");
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return alert("정렬할 텍스트 라인들을 드래그로 선택해 주세요.");

    const text = textarea.value;
    const selected = text.substring(start, end);
    const lines = selected.split('\n');
    
    lines.sort((a, b) => a.localeCompare(b, 'ko-KR'));
    const sortedText = lines.join('\n');

    setRawText(text.substring(0, start) + sortedText + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + sortedText.length);
    }, 0);
  };

  // 데이터 보관소 직렬화 및 저장 연산 파이프라인
  const handleSave = async () => {
    console.log("[EditorPage] 출간 저장 데이터 검증 및 페이로드 빌드 개시.");
    if (!title.trim()) return alert("제목을 입력해주세요.");
    
    try {
      if (docType === 'work') {
        // ★ 기존 원본 데이터를 스프레드 연산자로 안전하게 가져온 뒤 덮어씀
        const meta = {
          ...workMeta.originalMeta,
          alias: workMeta.alias,
          charExt: workMeta.charExt || 'png',
          coverExt: workMeta.coverExt,
          overview: overviewText,
        };
        
        const validVariants = workMeta.imgVariants.filter(v => v.trim() !== '');
        if (validVariants.length > 0) meta.imgVariants = validVariants;

        const goObj = {};
        workMeta.groupOrderStr.split('\n').forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const k = parts[0].trim();
            const vals = parts[1].split(',').map(v => v.trim()).filter(v => v !== "");
            if (k && vals.length > 0) goObj[k] = vals;
          }
        });
        if (Object.keys(goObj).length > 0) meta._groupOrder = goObj;

        const finalDesc = `[META_DATA:${JSON.stringify(meta)}]\n${rawText}`;
        const payload = {
          title, description: finalDesc, creator: workMeta.creator, genre: workMeta.genre, status: workMeta.status,
          checkDate: new Date().toLocaleDateString('ko-KR')
        };

        console.log("[EditorPage] 작품 설정 전송 페이로드 구조체:", payload);
        if (docAction === 'edit') {
          await api.put(`/api/works/${targetId}`, { ...payload, id: targetId });
          navigate(`/work/${targetId}`);
        } else {
          const res = await api.post('/api/works', payload);
          navigate(`/work/${res.data.id}`);
        }
      } 
      else if (docType === 'page') {
        const payload = { title, content: rawText, workId: parseInt(targetWorkId) };
        const pId = searchParams.get('parentId');
        if (pId && pId !== 'null') payload.parentId = parseInt(pId);

        console.log("[EditorPage] 위키 문서 전송 페이로드 구조체:", payload);
        if (docAction === 'edit') {
          await api.put(`/api/wikipages/${targetId}`, { ...payload, id: targetId });
          navigate(`/work/${targetWorkId}?pageId=${targetId}`);
        } else {
          const res = await api.post('/api/wikipages', payload);
          navigate(`/work/${targetWorkId}?pageId=${res.data.id}`);
        }
      }
      else if (docType === 'char') {
        const dp = {
          pageBody: { rawText },
          themeColor: themeColor,
          _cardLabel1: cardLabels.label1,
          _cardLabel2: cardLabels.label2,
        };

        const payload = { workId: targetWorkId, name: title };
        const pOrder = [];

        charProps.forEach(p => {
          if (!p.key.trim() || !p.val.trim()) return;
          let val = p.val.trim();
          if (p.key === '나이' && /^\d+(\.\d+)?$/.test(val)) val += '세';
          
          if (p.key === '나이') payload.age = val;
          if (p.key === '생일') payload.birthday = val;
          if (p.key === '성별') payload.gender = val;
          if (p.key === '종족') payload.species = val;

          dp[p.key] = val;
          pOrder.push(p.key);
        });

        pOrder.push("작품명", "제작자");
        dp["작품명"] = workContext ? workContext.title : "";
        dp["제작자"] = workContext ? (workContext.creator || "미상") : "미상";
        dp._propOrder = pOrder;

        const cExt = workContext ? (extractMeta(workContext.description).meta.charExt || 'png') : 'png';
        payload.imageCode = `${workContext?.title || '불명'}_${title}.${cExt}`;
        payload.dynamicProperties = JSON.stringify(dp);

        console.log("[EditorPage] 등장인물 전송 페이로드 구조체:", payload);
        if (docAction === 'edit') {
          await api.put(`/api/characters/${targetId}`, { ...payload, id: targetId });
        } else {
          await api.post('/api/characters', payload);
        }
        navigate(`/work/${targetWorkId}`);
      }
    } catch (err) {
      console.error("[EditorPage] 출간 통신 에러 발생:", err);
      alert("저장 처리에 실패했습니다 원인을 파악하십시오.");
    }
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setRawText(rawText.substring(0, start) + "    " + rawText.substring(end));
      setTimeout(() => {
        editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  // 툴바 모달에서 텍스트 삽입 시 호출되는 콜백
  const handleMacroInsert = (newText, newCursorPos) => {
    setRawText(newText);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontWeight: 'bold' }}>에디터 로딩 중...</div>;

  return (
    <div className={styles.editorFullBleed}>
      
      <EditorSearch editorRef={editorRef} updatePreview={() => {}} />
      <MacroToolbar editorRef={editorRef} onInsert={handleMacroInsert} />

      <header className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          <button className="wiki-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={handleGoBack}>⬅ 돌아가기</button>
          <span className={styles.modeBadge}>{badgeText}</span>
        </div>
        <div className={styles.headerRight}>
          <button className="wiki-btn" style={{ background: 'var(--primary-color)', color: 'white', fontWeight: 'bold' }} onClick={handleSave}>💾 출간하기 (저장)</button>
        </div>
      </header>

      <div className={styles.editorLayout}>
        
        {/* 좌측 실시간 렌더링 뷰어 영역 */}
        <div className={`${styles.previewPane} ${!isPreviewOpen ? styles.hidden : ''}`}>
          <h1 style={{ fontSize: '28px', color: 'var(--primary-color)', marginTop: 0, marginBottom: '15px' }}>{title || '제목 없음'}</h1>
          
          {/* ★ 실시간 뷰 작품 제목 하단 속성 및 제작자명 렌더링 구역 복원 */}
          <div className={styles.previewMetaBox}>
            {docType === 'work' && workMeta.genre && workMeta.genre.split(',').map((g, idx) => (
              g.trim() && <span key={idx} className={styles.previewTag}>{g.trim()}</span>
            ))}
            {docType === 'work' && workMeta.creator && (
              <span className={styles.previewInfo}>✍️ {workMeta.creator}</span>
            )}
            {docType === 'char' && charProps.map((p, idx) => (
              p.key && p.val && p.key !== '부제목' && (
                <span key={idx} className={styles.previewInfo}><strong>{p.key}</strong>: {p.val}</span>
              )
            ))}
          </div>
          
          {docType === 'work' && overviewText && (
            <>
              <h3 className="md-h1">1. 개요</h3>
              <MarkdownRenderer rawText={overviewText} />
              <h3 className="md-h1" style={{ marginTop: '30px' }}>2. 세계관 설정</h3>
            </>
          )}

          <MarkdownRenderer rawText={rawText || "마크다운을 작성하면 이곳에 표시됩니다."} />
        </div>

        {/* 중앙 분할 조절 바 리사이저 */}
        <div className={styles.paneResizer}>
          <button className={styles.togglePreviewBtn} onClick={() => setIsPreviewOpen(!isPreviewOpen)}>{isPreviewOpen ? '◀' : '▶'}</button>
        </div>

        {/* 우측 작업 편집 UI 창 */}
        <div className={styles.writePane}>
          <input 
            className={styles.editorTitleInput} 
            placeholder="제목을 입력하세요" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />

          {docType === 'work' && (
            <details className={styles.metaDetails} open>
              <summary>⚙️ 상세 속성 설정 (클릭하여 펴기/접기)</summary>
              <div className={styles.metaGrid}>
                <div className={styles.propRow}>
                  <label>제작자 명의</label>
                  <input value={workMeta.creator} onChange={e => setWorkMeta({...workMeta, creator: e.target.value})} placeholder="미상" />
                </div>
                <div className={styles.propRow}>
                  <label>장르 태그</label>
                  <input value={workMeta.genre} onChange={e => setWorkMeta({...workMeta, genre: e.target.value})} placeholder="판타지, 로맨스 등 (쉼표 구분)" />
                </div>
                <div className={styles.propRow}>
                  <label>검색 약칭</label>
                  <input value={workMeta.alias} onChange={e => setWorkMeta({...workMeta, alias: e.target.value})} placeholder="대문 검색용 별명" />
                </div>
                <div className={styles.propRow}>
                  <label>연재 상태</label>
                  <select value={workMeta.status} onChange={e => setWorkMeta({...workMeta, status: e.target.value})}>
                    <option value="진행 전">진행 전</option>
                    <option value="진행 중">진행 중</option>
                    <option value="완료">완료</option>
                  </select>
                </div>
                <div className={styles.propRow}>
                  <label>대문 확장자</label>
                  <select value={workMeta.coverExt} onChange={e => setWorkMeta({...workMeta, coverExt: e.target.value})}>
                    <option value="">없음</option><option value="png">png</option><option value="jpg">jpg</option><option value="webp">webp</option><option value="gif">gif</option>
                  </select>
                </div>
                <div className={styles.propRow}>
                  <label>캐릭터 확장자</label>
                  <select value={workMeta.charExt} onChange={e => setWorkMeta({...workMeta, charExt: e.target.value})}>
                    <option value="png">png</option><option value="jpg">jpg</option><option value="webp">webp</option><option value="gif">gif</option>
                  </select>
                </div>
                <div className={styles.propRow} style={{ gridColumn: '1 / -1', alignItems: 'flex-start' }}>
                  <label>그룹 정렬 순서<br/><span style={{fontSize:'10px', color:'var(--primary-color)'}}>속성명: 값1, 값2...</span></label>
                  <textarea rows="3" value={workMeta.groupOrderStr} onChange={e => setWorkMeta({...workMeta, groupOrderStr: e.target.value})} placeholder="등급: S급, A급, B급..." />
                </div>

                {/* ★ 이미지 바리에이션 편집 폼 영역 완벽 복원 */}
                <div className={styles.propRow} style={{ gridColumn: '1 / -1', alignItems: 'flex-start', paddingTop: '15px', borderTop: '1px dashed var(--border-color)' }}>
                  <label>👗 이미지 변환<br/><span style={{fontSize:'10px', color:'var(--primary-color)'}}>(Shift+좌클릭용)</span></label>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {workMeta.imgVariants.map((variant, vIdx) => (
                      <div key={vIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="바리에이션 명칭 (예: 사복, 전투복)" 
                          value={variant} 
                          onChange={e => handleVariantChange(vIdx, e.target.value)} 
                        />
                        <button type="button" style={{ border: 'none', background: 'transparent', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleRemoveVariant(vIdx)}>✖</button>
                      </div>
                    ))}
                    <button type="button" className="wiki-btn" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '12px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }} onClick={handleAddVariant}>+ 복장/변신 칸 추가</button>
                  </div>
                </div>

              </div>
            </details>
          )}

          {docType === 'char' && (
            <details className={styles.metaDetails} open>
              <summary>⚙️ 캐릭터 상세 속성 설정</summary>
              <div className={styles.metaGrid} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={styles.propRow}>
                  <label>테마 컬러</label>
                  <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{ width: '40px', padding: 0 }} />
                  <input type="text" value={themeColor} disabled />
                </div>
                <div className={styles.propRow}>
                  <label>라벨 (이름 옆)</label>
                  <input value={cardLabels.label1} onChange={e => setCardLabels({...cardLabels, label1: e.target.value})} placeholder="나이" />
                </div>
                <div className={styles.propRow}>
                  <label>라벨 (이름 아래)</label>
                  <input value={cardLabels.label2} onChange={e => setCardLabels({...cardLabels, label2: e.target.value})} placeholder="성격" />
                </div>
                {charProps.map((p, i) => (
                  <div key={i} className={styles.propRow}>
                    <input style={{ width: '100px', flex: 'none', textAlign: 'center' }} value={p.key} onChange={e => {
                      const newProps = [...charProps]; newProps[i].key = e.target.value; setCharProps(newProps);
                    }} placeholder="속성명" />
                    <input style={{ flex: 1 }} value={p.val} onChange={e => {
                      const newProps = [...charProps]; newProps[i].val = e.target.value; setCharProps(newProps);
                    }} placeholder="내용" />
                    <button className="wiki-btn" style={{ padding: '4px 8px', color: '#e53e3e', background: 'transparent', border: 'none' }} onClick={() => {
                      const newProps = [...charProps]; newProps.splice(i, 1); setCharProps(newProps);
                    }}>✖</button>
                  </div>
                ))}
                <button className="wiki-btn" style={{ alignSelf: 'flex-start', background: 'var(--table-bg-alt)', color: 'var(--text-primary)' }} onClick={() => setCharProps([...charProps, { key: '', val: '' }])}>+ 속성 추가</button>
              </div>
            </details>
          )}

          {docType === 'work' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>1. 개요 (상세 본문)</label>
              <textarea 
                className={styles.editorTextarea} 
                style={{ height: '150px', flex: 'none' }} 
                placeholder="개요에 들어갈 상세 내용을 마크다운으로 작성하세요..."
                value={overviewText}
                onChange={e => setOverviewText(e.target.value)}
              />
            </div>
          )}

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', marginTop: docType === 'work' ? '0' : '10px' }}>
            {docType === 'work' ? '2. 세계관 설정' : '문서 내용 작성'}
          </label>

          {/* ★ 서식 제어 툴바 UI 인터페이스 구역 탑재 복원 */}
          <div className={styles.formatToolbar}>
            <select className={styles.formatSelect} defaultValue="" onChange={(e) => { if(e.target.value) { applyTextFormat(`[폰트:${e.target.value}:`, ']'); e.target.value = ''; } }}>
              <option value="" disabled>글꼴 변경</option><option value="명조">명조체</option><option value="궁서">궁서체</option><option value="바탕">바탕체</option><option value="돋움">돋움체</option><option value="굴림">굴림체</option>
            </select>
            <select className={styles.formatSelect} defaultValue="" onChange={(e) => { if(e.target.value) { applyTextFormat(`[크기:${e.target.value}:`, ']'); e.target.value = ''; } }}>
              <option value="" disabled>크기 변경</option><option value="12">12px</option><option value="14">14px</option><option value="16">16px</option><option value="20">20px</option><option value="24">24px</option><option value="32">32px</option>
            </select>
            <button type="button" className={styles.formatBtn} onClick={() => applyTextFormat('**', '**')}>굵게</button>
            <button type="button" className={styles.formatBtn} onClick={() => applyTextFormat('_', '_')}>기울임</button>
            <button type="button" className={styles.formatBtn} onClick={() => applyTextFormat('--', '--')}>취소선</button>
            <button type="button" className={styles.formatBtn} onClick={() => applyTextFormat('[정렬:중앙:', ']')}>중앙정렬</button>
            <button type="button" className={styles.formatBtn} onClick={() => applyTextFormat('[정렬:우측:', ']')}>우측정렬</button>
            <button type="button" className={styles.formatBtn} onClick={() => applyTextFormat('[들여쓰기:', ']')}>들여쓰기</button>
            <button type="button" className={styles.formatBtn} onClick={sortSelectedLines}>가나다정렬</button>
          </div>

          <textarea 
            ref={editorRef}
            className={styles.editorTextarea} 
            placeholder="마크다운으로 내용을 자유롭게 작성하세요..."
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            onKeyDown={handleEditorKeyDown}
          />
        </div>

      </div>
    </div>
  );
};

export default EditorPage;
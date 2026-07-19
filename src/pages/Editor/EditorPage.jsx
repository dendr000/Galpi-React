// 파일 위치: src/pages/EditorPage/EditorPage.jsx
// 기능 요약: 이미지 바리에이션 제어 구조, 서식 단축 툴바 컴포넌트 및 프리뷰 메타데이터 실시간 동기화 스튜디오 화면 엔진 (v2.0.1)

import React from 'react';
import styles from './EditorPage.module.css';
import MarkdownRenderer from '../../domains/macro/MarkdownRenderer';
import EditorSearch from './EditorSearch';
import MacroToolbar from '../../domains/macro/MacroToolbar';
import { useEditorData } from './useEditorData'; // ★ 분리된 비즈니스 로직 훅 임포트

const EditorPage = () => {
  console.log(`[EditorPage] UI 렌더링 사이클 개시`);
  
  // ★ 커스텀 훅에서 상태 및 함수 추출
  const {
    docType, docAction, loading, isPreviewOpen, setIsPreviewOpen,
    title, setTitle, rawText, setRawText, overviewText, setOverviewText,
    workMeta, setWorkMeta, charProps, setCharProps, themeColor, setThemeColor,
    cardLabels, setCardLabels, editorRef, handleGoBack, handleSave
  } = useEditorData();

  const badgeText = 
    docType === 'work' ? (docAction === 'new' ? '📚 새 작품 등록' : '📚 작품 설정 편집') : 
    docType === 'page' ? (docAction === 'new' ? '📄 새 위키 문서' : '📄 문서 편집') :
    (docAction === 'new' ? '👤 새 캐릭터 추가' : '👤 캐릭터 상세 편집');

  const handleAddVariant = () => {
    setWorkMeta(prev => ({ ...prev, imgVariants: [...prev.imgVariants, ''] }));
  };

  const handleVariantChange = (index, value) => {
    const newVariants = [...workMeta.imgVariants];
    newVariants[index] = value;
    setWorkMeta(prev => ({ ...prev, imgVariants: newVariants }));
  };

  const handleRemoveVariant = (index) => {
    const newVariants = [...workMeta.imgVariants];
    newVariants.splice(index, 1);
    setWorkMeta(prev => ({ ...prev, imgVariants: newVariants.length > 0 ? newVariants : [''] }));
  };

  const applyTextFormat = (prefix, suffix) => {
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

  const sortSelectedLines = () => {
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
        
        <div className={`${styles.previewPane} ${!isPreviewOpen ? styles.hidden : ''}`}>
          <h1 style={{ fontSize: '28px', color: 'var(--primary-color)', marginTop: 0, marginBottom: '15px' }}>{title || '제목 없음'}</h1>
          
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
              <h3 className="md-h1" style={{ marginTop: '30px' }}>2. 설정</h3>
            </>
          )}

          <MarkdownRenderer rawText={rawText || "마크다운을 작성하면 이곳에 표시됩니다."} />
        </div>

        <div className={styles.paneResizer}>
          <button className={styles.togglePreviewBtn} onClick={() => setIsPreviewOpen(!isPreviewOpen)}>{isPreviewOpen ? '◀' : '▶'}</button>
        </div>

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
            {docType === 'work' ? '2. 설정' : '문서 내용 작성'}
          </label>

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
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosCore';
import styles from './Editor.module.css'; // 이전에 만들었던 css
import { extractMeta, buildMetaStr, renderMarkdown } from '../utils/markdownParser';

// [내부 컴포넌트] Ctrl+F 찾기 바꾸기 모달
const EditorSearch = ({ editorRef, content, setContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault(); e.stopPropagation(); setIsOpen(true);
        const selected = window.getSelection().toString().trim();
        if (selected && selected.length < 50) setFindText(selected);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const replaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    setContent(content.replace(regex, replaceText));
  };

  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', borderRadius: '8px', zIndex: 10000, padding: '12px', display: 'flex', gap: '8px' }}>
      <input type="text" value={findText} onChange={e => setFindText(e.target.value)} placeholder="찾기" style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px' }} autoFocus />
      <input type="text" value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="바꿀 내용" style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
      <button className="wiki-btn" onClick={replaceAll}>모두 바꾸기</button>
      <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'transparent', color: '#e53e3e', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
    </div>
  );
};

// [메인 컴포넌트] 에디터 스튜디오
const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const docType = searchParams.get('type') || 'work';
  const targetId = searchParams.get('id');
  const targetWorkId = searchParams.get('workId');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [overview, setOverview] = useState('');
  
  // 작품 속성
  const [meta, setMeta] = useState({ creator: '', genre: '', status: '진행 전' });
  // 캐릭터 속성
  const [cColor, setCColor] = useState('#3b5bdb');
  const [props, setProps] = useState([]); 

  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const editorRef = useRef(null);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (docType === 'work' && targetId) {
          const { data } = await api.get(`/api/works/${targetId}`);
          setTitle(data.title || '');
          setMeta({ creator: data.creator || '', genre: data.genre || '', status: data.status || '진행 전' });
          const parsed = extractMeta(data.description);
          setContent(parsed.clean || '');
          setOverview(parsed.meta.overview || '');
        } 
        else if (docType === 'char' && targetId) {
          const { data } = await api.get(`/api/characters?workId=${targetWorkId}`);
          const char = data.find(c => String(c.id) === targetId);
          if (char) {
            setTitle(char.name);
            let dp = {}; try { dp = JSON.parse(char.dynamicProperties); } catch(e){}
            setCColor(dp.themeColor || char.themeColor || '#3b5bdb');
            setContent(dp.pageBody?.rawText || "");
            
            const loadedProps = [{ key: '나이', val: char.age || '' }, { key: '성별', val: char.gender || '' }, { key: '종족', val: char.species || '' }];
            Object.keys(dp).forEach(k => {
              if (!["age", "gender", "species", "workId", "id", "imageCode", "name", "_propOrder", "pageBody", "themeColor"].includes(k) && !k.startsWith('_')) {
                loadedProps.push({ key: k, val: dp[k] });
              }
            });
            setProps(loadedProps);
          }
        }
      } catch (err) {}
    };
    fetchData();
  }, [docType, targetId, targetWorkId]);

  // 저장 로직
  const handleSave = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    try {
      if (docType === 'work') {
        const payload = { title, creator: meta.creator, genre: meta.genre, status: meta.status, description: buildMetaStr(content, { overview }) };
        const res = await api({ method: targetId ? 'PUT' : 'POST', url: targetId ? `/api/works/${targetId}` : '/api/works', data: payload });
        navigate(`/work/${res.data.id}`);
      } else if (docType === 'char') {
        const dp = { pageBody: { rawText: content }, themeColor: cColor, _propOrder: [] };
        const payload = { workId: parseInt(targetWorkId), name: title };
        props.forEach(p => {
          if (!p.key || !p.val) return;
          if (p.key === '나이') payload.age = p.val;
          else if (p.key === '성별') payload.gender = p.val;
          else if (p.key === '종족') payload.species = p.val;
          else { dp[p.key] = p.val; dp._propOrder.push(p.key); }
        });
        payload.dynamicProperties = JSON.stringify(dp);
        await api({ method: targetId ? 'PUT' : 'POST', url: targetId ? `/api/characters/${targetId}` : '/api/characters', data: payload });
        navigate(`/work/${targetWorkId}`);
      }
    } catch (e) { alert("저장에 실패했습니다."); }
  };

  // 서식 주입
  const wrapText = (prefix, suffix) => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    if (!selected) return alert("마우스로 텍스트를 먼저 드래그하세요!");
    setContent(content.substring(0, start) + prefix + selected + suffix + content.substring(end));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length); }, 10);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EditorSearch editorRef={editorRef} content={content} setContent={setContent} />

      <header className={styles['editor-header']}>
        <div className={styles['header-inner']}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button className={styles['nav-btn']} onClick={() => navigate(-1)}>⬅ 돌아가기</button>
            <span className={styles['mode-badge']}>{docType === 'work' ? '📚 작품 편집' : '👤 캐릭터 편집'}</span>
          </div>
          <button className={styles['save-btn']} onClick={handleSave}>💾 출간하기 (저장)</button>
        </div>
      </header>

      <div className={styles['editor-layout']}>
        
        {/* ★ [복원] 좌측: 실시간 미리보기 창 (preview-pane) */}
        {isPreviewOpen && (
          <div className={`${styles['editor-pane']} ${styles['preview-pane']}`} style={{ borderRight: '1px solid var(--border-color)' }}>
            <h1 className={styles['preview-title']}>{title || '제목 없음'}</h1>
            <div className="markdown-body">
              {docType === 'work' && overview && (
                <div style={{ marginBottom: '20px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '15px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>1. 개요</h3>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(overview) }} />
                  <h3 style={{ color: 'var(--primary-color)' }}>2. 세계관 설정</h3>
                </div>
              )}
              {/* 타자를 치면 빛의 속도로 변환되는 실시간 바인딩 영역 */}
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
            </div>
          </div>
        )}

        {/* 중앙 리사이저 */}
        <div className={styles['pane-resizer']}>
          <button className={styles['toggle-preview-btn']} onClick={() => setIsPreviewOpen(!isPreviewOpen)}>{isPreviewOpen ? '▶' : '◀'}</button>
        </div>

        {/* ★ [복원] 우측: 마크다운 작성 창 (write-pane) */}
        <div className={`${styles['editor-pane']} ${styles['write-pane']}`} style={{ borderLeft: 'none' }}>
          <input type="text" className={styles['editor-title-input']} placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />

          {docType === 'char' && (
            <details className={styles['meta-details']} open>
              <summary>⚙️ 캐릭터 동적 속성 설정</summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className={styles['prop-row']}><label>테마 색상</label><input type="color" value={cColor} onChange={e=>setCColor(e.target.value)} style={{width:'50px', padding:'2px', cursor:'pointer'}} /></div>
                {props.map((prop, idx) => (
                  <div key={idx} className={styles['prop-row']}>
                    <input type="text" value={prop.key} onChange={e => { const np = [...props]; np[idx].key = e.target.value; setProps(np); }} style={{ width: '100px', flexShrink: 0 }} />
                    <input type="text" value={prop.val} onChange={e => { const np = [...props]; np[idx].val = e.target.value; setProps(np); }} style={{ flex: 1 }} />
                    <button className={styles['prop-del']} onClick={() => setProps(props.filter((_, i) => i !== idx))}>✖</button>
                  </div>
                ))}
                <button className="wiki-btn" onClick={() => setProps([...props, { key: '', val: '' }])} style={{ background: 'var(--text-secondary)', width: 'fit-content' }}>+ 속성 추가</button>
              </div>
            </details>
          )}

          {docType === 'work' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>1. 개요 (상세 본문)</label>
              <textarea className={styles['editor-textarea']} style={{ minHeight: '150px', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px' }} placeholder="개요 작성..." value={overview} onChange={(e) => setOverview(e.target.value)} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--table-bg-alt)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '10px' }}>
            <button className="wiki-btn" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }} onClick={() => wrapText('**', '**')}>B 볼드</button>
            <button className="wiki-btn" style={{ background: 'var(--bg-color)', color: '#e53e3e' }} onClick={() => wrapText('[red:', ']')}>🔴 빨강</button>
            <button className="wiki-btn" style={{ background: 'var(--bg-color)', color: 'var(--primary-color)' }} onClick={() => wrapText('[blue:', ']')}>🔵 파랑</button>
            <button className="wiki-btn" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }} onClick={() => wrapText('[정렬:중앙:\n', '\n]')}>⫼ 중앙정렬</button>
          </div>
          
          <textarea ref={editorRef} className={styles['editor-textarea']} placeholder="마크다운 내용..." value={content} onChange={(e) => setContent(e.target.value)} />
        </div>

        {/* 중앙 리사이저 */}
        <div className={styles['pane-resizer']}>
          <button className={styles['toggle-preview-btn']} onClick={() => setIsPreviewOpen(!isPreviewOpen)}>{isPreviewOpen ? '◀' : '▶'}</button>
        </div>

        {/* 우측: 실시간 미리보기 창 */}
        {isPreviewOpen && (
          <div className={`${styles['editor-pane']} ${styles['preview-pane']}`}>
            <h1 className={styles['preview-title']}>{title || '제목 없음'}</h1>
            <div className="markdown-body">
              {docType === 'work' && overview && (
                <div style={{ marginBottom: '20px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '15px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>1. 개요</h3>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(overview) }} />
                  <h3 style={{ color: 'var(--primary-color)' }}>2. 세계관 설정</h3>
                </div>
              )}
              {/* 타자를 치면 빛의 속도로 변환되는 실시간 바인딩 영역 */}
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
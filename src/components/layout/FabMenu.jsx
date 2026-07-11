import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';
import api from '../../api/axiosCore';

const ModalOverlay = ({ title, onClose, children, width = '500px', actions }) => (
  <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-color)', width: '90%', maxWidth: width, maxHeight: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
      <div style={{ padding: '15px 20px', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '16px' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {actions}
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1 }}>&times;</button>
        </div>
      </div>
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {children}
      </div>
    </div>
  </div>
);

const FabMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeModal, openModal, closeModal, clipboardHistory, addClipboard, clearClipboard } = useModalStore();
  const navigate = useNavigate();
  const location = useLocation();
  const currentWorkId = new URLSearchParams(location.search).get('workId') || location.pathname.match(/\/work\/(\d+)/)?.[1] || 'global';

  const [dictList, setDictList] = useState([]);
  const [dictInput, setDictInput] = useState({ word: '', trans: '' });
  const [dictSearch, setDictSearch] = useState('');
  const [dictBulk, setDictBulk] = useState('');
  const [isDictBulkMode, setIsDictBulkMode] = useState(false);

  const [bpList, setBpList] = useState([]);
  const [bpInput, setBpInput] = useState({ title: '', content: '' });
  const [bpBulk, setBpBulk] = useState('');
  const [isBpBulkMode, setIsBpBulkMode] = useState(false);

  const [searchChars, setSearchChars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [recentWorks, setRecentWorks] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2000); };

  // 전역 클립보드 및 단축키 캡처 이벤트
  useEffect(() => {
    const handleCopy = () => { const text = window.getSelection().toString(); if (text) addClipboard(text); };
    const handleKey = (e) => {
      // Ctrl + Shift + V (클립보드 히스토리 팝업)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') { e.preventDefault(); openModal('clipboard'); }
      
      // Alt + H (고유명사 사전 한자 변환)
      if (e.altKey && e.key.toLowerCase() === 'h' && e.target.tagName.match(/INPUT|TEXTAREA/)) {
        e.preventDefault(); e.stopPropagation();
        const input = e.target; const text = input.value; const cursor = input.selectionStart;
        const textBefore = text.substring(0, cursor);
        const keys = dictList.map(d=>d.word).sort((a,b)=>b.length-a.length); // 긴 단어부터 매칭
        
        for (let k of keys) {
          const trans = dictList.find(d => d.word === k)?.translation || '';
          const pureVal = trans.match(/\((.*?)\)/) ? trans.match(/\((.*?)\)/)[1] : trans.replace(k, '').replace(/[\(\)]/g, '');
          const step1 = k, step2 = `${k}(${pureVal})`, step3 = pureVal;
          let rep = null, mLen = 0;
          
          if (textBefore.endsWith(step1)) { rep = step2; mLen = step1.length; }
          else if (textBefore.endsWith(step2)) { rep = step3; mLen = step2.length; }
          else if (textBefore.endsWith(step3)) { rep = step1; mLen = step3.length; }

          if (rep) {
            input.value = text.substring(0, cursor - mLen) + rep + text.substring(cursor);
            input.selectionStart = input.selectionEnd = cursor - mLen + rep.length;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            break;
          }
        }
      }
    };
    document.addEventListener('copy', handleCopy); document.addEventListener('cut', handleCopy); document.addEventListener('keydown', handleKey, true);
    return () => { document.removeEventListener('copy', handleCopy); document.removeEventListener('cut', handleCopy); document.removeEventListener('keydown', handleKey, true); };
  }, [addClipboard, openModal, dictList]);

  // 모달 데이터 페칭
  useEffect(() => {
    if (activeModal === 'dict') api.get(`/api/dicts?workId=${currentWorkId}`).then(res => setDictList(res.data)).catch(()=>{});
    if (activeModal === 'boilerplate') api.get('/api/boilerplates').then(res => setBpList(res.data)).catch(()=>{});
    if (activeModal === 'search') {
      if (currentWorkId !== 'global') api.get(`/api/characters?workId=${currentWorkId}`).then(res => setSearchChars(res.data)).catch(()=>{});
      else { alert("작품 상세 화면에서만 검색이 가능합니다."); closeModal(); }
    }
    if (activeModal === 'recent') {
      const ids = JSON.parse(localStorage.getItem('galpi-recent-works') || '[]');
      if (ids.length > 0) api.get('/api/works').then(res => setRecentWorks(ids.map(id => res.data.find(w => w.id === id)).filter(Boolean))).catch(()=>{});
    }
  }, [activeModal, currentWorkId]);

  const handleDictBulk = async () => {
    if (!dictBulk.trim()) return alert("입력된 텍스트가 없습니다.");
    const lines = dictBulk.split('\n');
    const payloads = []; const newDict = [...dictList];
    lines.forEach(line => {
      const match = line.trim().match(/^([^\(\)]+)\(([^\(\)]+)\)$/);
      if (match) {
        let key = match[1].trim(), val = match[2].trim();
        if (/[가-힣]/.test(val) && !/[가-힣]/.test(key)) { key = match[2].trim(); val = match[1].trim(); }
        if (!newDict.find(d => d.word === key)) { newDict.push({workId: currentWorkId, word: key, translation: val}); payloads.push({ workId: currentWorkId, word: key, translation: val }); }
      }
    });
    if (payloads.length > 0) {
      await api.post('/api/dicts/bulk', payloads);
      setDictList(newDict); setDictBulk(''); setIsDictBulkMode(false); showToast(`✨ ${payloads.length}개 일괄 등록 완료!`);
    } else alert("올바른 형태가 없습니다.");
  };

  const handleBpBulk = async () => {
    if (!bpBulk.trim()) return alert("입력된 텍스트가 없습니다.");
    const lines = bpBulk.split('\n');
    let count = 0;
    for (let line of lines) {
      line = line.trim(); if(!line) continue;
      let title = "", content = "";
      if (line.includes('::::')) {
        const p = line.split('::::'); title = p[0].trim(); content = p.slice(1).join('::::').trim();
      } else {
        const match = line.match(/^([^\(\)]+)\(([^\(\)]+)\)$/);
        if (match) {
           let k = match[1].trim(), v = match[2].trim();
           if(/[가-힣]/.test(v) && !/[가-힣]/.test(k)) { k = match[2].trim(); v = match[1].trim(); }
           title = k; content = `${k}(${v})`;
        }
      }
      if (title && content && !bpList.some(b => b.title === title)) {
        await api.post('/api/boilerplates', { title, content, category: '공통' });
        count++;
      }
    }
    if (count > 0) {
      api.get('/api/boilerplates').then(res => setBpList(res.data));
      setBpBulk(''); setIsBpBulkMode(false); showToast(`✨ ${count}개 일괄 등록 완료!`);
    } else alert("등록 가능한 패턴이 없거나 모두 중복입니다.");
  };

  const btnSty = { width: '48px', height: '48px', borderRadius: '50%', padding: 0, fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
  const inpSty = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' };

  return (
    <>
      <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9000, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => setIsOpen(!isOpen)} style={{ width: '60px', height: '60px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,91,219,0.5)', transition: '0.3s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>
          {isOpen ? '✖' : '➕'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '12px', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transform: isOpen ? 'translateY(0)' : 'translateY(20px)', transition: '0.3s' }}>
          <button className="wiki-btn" onClick={() => { setIsOpen(false); navigate('/bulk'); }} style={btnSty} title="일괄 수정">📦</button>
          <button className="wiki-btn" onClick={() => { setIsOpen(false); navigate('/memo'); }} style={btnSty} title="메모 캔버스">🌌</button>
          {currentWorkId && currentWorkId !== 'global' && <button className="wiki-btn" onClick={() => openModal('search')} style={btnSty} title="현재 작품 캐릭터 검색">🔍</button>}
          <button className="wiki-btn" onClick={() => openModal('dict')} style={btnSty} title="고유명사 사전 (Alt+H)">📖</button>
          <button className="wiki-btn" onClick={() => openModal('boilerplate')} style={btnSty} title="스마트 상용구">⚡</button>
          <button className="wiki-btn" onClick={() => openModal('clipboard')} style={btnSty} title="클립보드 내역 (Ctrl+Shift+V)">📋</button>
          <button className="wiki-btn" onClick={() => openModal('recent')} style={btnSty} title="최근 열람 기록">🕒</button>
          <button className="wiki-btn" onClick={() => { setIsOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }} style={{...btnSty, background: 'var(--table-bg-alt)'}} title="최상단 이동">⬆️</button>
        </div>
      </div>

      <div style={{ position: 'fixed', top: '30px', left: '50%', transform: toastMsg ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-20px)', opacity: toastMsg ? 1 : 0, background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', transition: '0.3s', zIndex: 100001, pointerEvents: 'none', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
        {toastMsg}
      </div>

      {activeModal === 'clipboard' && (
        <ModalOverlay title="📋 클립보드 히스토리" onClose={closeModal} actions={<button onClick={clearClipboard} style={{ border: '1px solid #e53e3e', color: '#e53e3e', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', padding: '4px 8px' }}>전체 삭제</button>}>
          {clipboardHistory.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>복사된 내역이 없습니다.</div> : clipboardHistory.map((text, i) => (
            <div key={i} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color)', background: 'var(--table-bg-alt)', padding: '2px 6px', borderRadius: '4px' }}>#{i+1}</span><button className="wiki-btn" style={{ fontSize: '11px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }} onClick={() => { navigator.clipboard.writeText(text); showToast('복사되었습니다.'); closeModal(); }}>다시 복사</button></div>
              <div style={{ fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</div>
            </div>
          ))}
        </ModalOverlay>
      )}

      {/* ★ 에러 원인 해결 (onKeyDown 핸들러 부분 async 함수 선언 수정) */}
      {activeModal === 'dict' && (
        <ModalOverlay title="📖 고유명사 한자/영문 사전" onClose={closeModal} width="550px">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="원문" value={dictInput.word} onChange={e=>setDictInput({...dictInput, word: e.target.value})} style={{...inpSty, flex: 1}} />
            <input 
              type="text" 
              placeholder="한자/영문" 
              value={dictInput.trans} 
              onChange={e=>setDictInput({...dictInput, trans: e.target.value})} 
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  if(!dictInput.word || !dictInput.trans) return;
                  await api.post('/api/dicts', { workId: currentWorkId, word: dictInput.word, translation: dictInput.trans });
                  setDictList([...dictList, { workId: currentWorkId, word: dictInput.word, translation: dictInput.trans }]);
                  setDictInput({ word: '', trans: '' });
                }
              }} 
              style={{...inpSty, flex: 1}} 
            />
            <button className="wiki-btn" onClick={async () => {
              if(!dictInput.word || !dictInput.trans) return;
              await api.post('/api/dicts', { workId: currentWorkId, word: dictInput.word, translation: dictInput.trans });
              setDictList([...dictList, { workId: currentWorkId, word: dictInput.word, translation: dictInput.trans }]);
              setDictInput({ word: '', trans: '' });
            }} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>추가</button>
            <button className="wiki-btn" onClick={()=>setIsDictBulkMode(!isDictBulkMode)} style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>일괄 ▾</button>
          </div>
          {isDictBulkMode && (
             <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <span style={{ fontSize: '12px', fontWeight: 'bold' }}>📝 다량 등록 (해적왕(海敵王) 줄바꿈 구분)</span>
               <textarea value={dictBulk} onChange={e=>setDictBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px' }}></textarea>
               <button className="wiki-btn" onClick={handleDictBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px' }}>🚀 실행</button>
             </div>
          )}
          <input type="text" placeholder="사전 검색..." value={dictSearch} onChange={e=>setDictSearch(e.target.value)} style={{...inpSty, width: '100%', boxSizing: 'border-box'}} />
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead style={{ background: 'var(--table-bg-alt)', position: 'sticky', top: 0 }}>
                <tr><th style={{padding:'10px', borderBottom:'1px solid var(--border-color)'}}>원문</th><th style={{padding:'10px', borderBottom:'1px solid var(--border-color)'}}>변환 단어</th><th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', width:'50px'}}>삭제</th></tr>
              </thead>
              <tbody>
                {dictList.filter(d => d.word.includes(dictSearch) || d.translation.includes(dictSearch)).map((d, i) => (
                  <tr key={i}><td style={{padding:'8px', borderBottom:'1px solid var(--border-color)'}}><b>{d.word}</b></td><td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color:'var(--primary-color)', fontWeight:'bold'}}>{d.translation}</td><td style={{padding:'8px', borderBottom:'1px solid var(--border-color)'}}><button onClick={async () => { await api.delete(`/api/dicts?workId=${currentWorkId}&word=${encodeURIComponent(d.word)}`); setDictList(dictList.filter(x => x.word !== d.word)); }} style={{ border:'none', background:'none', color:'#e53e3e', cursor:'pointer', fontWeight:'bold' }}>✖</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModalOverlay>
      )}

      {activeModal === 'boilerplate' && (
        <ModalOverlay title="⚡ 스마트 상용구 관리" onClose={closeModal} width="600px">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="단축어 (!검성)" value={bpInput.title} onChange={e=>setBpInput({...bpInput, title: e.target.value})} style={{...inpSty, flex: 1}} />
            <textarea placeholder="치환 본문" value={bpInput.content} onChange={e=>setBpInput({...bpInput, content: e.target.value})} style={{...inpSty, flex: 2, resize: 'none', height: '36px'}} />
            <button className="wiki-btn" onClick={async () => {
              if(!bpInput.title || !bpInput.content) return;
              const res = await api.post('/api/boilerplates', { title: bpInput.title, content: bpInput.content, category: '공통' });
              setBpList([...bpList, res.data]); setBpInput({title: '', content: ''});
            }} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>추가</button>
            <button className="wiki-btn" onClick={()=>setIsBpBulkMode(!isBpBulkMode)} style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>일괄 ▾</button>
          </div>
          {isBpBulkMode && (
             <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <span style={{ fontSize: '12px', fontWeight: 'bold' }}>📝 다량 등록 (단축어::::본문)</span>
               <textarea value={bpBulk} onChange={e=>setBpBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px' }}></textarea>
               <button className="wiki-btn" onClick={handleBpBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px' }}>🚀 실행</button>
             </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {bpList.map(b => (
              <div key={b.id} style={{ display: 'flex', padding: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '8px', alignItems: 'center' }}>
                <div style={{ width: '100px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '13px' }}>{b.title}</div>
                <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.content.replace('{#}', '[커서]')}</div>
                <button onClick={async () => { await api.delete(`/api/boilerplates/${b.id}`); setBpList(bpList.filter(x => x.id !== b.id)); }} style={{ border: 'none', background: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: 'bold' }}>삭제</button>
              </div>
            ))}
          </div>
        </ModalOverlay>
      )}

      {activeModal === 'search' && (
        <ModalOverlay title="🔍 캐릭터 빠른 검색" onClose={closeModal}>
          <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="이름 입력..." style={{ ...inpSty, width: '100%', boxSizing: 'border-box', border: '2px solid var(--primary-color)', padding: '12px' }} autoFocus />
          <div style={{ flex: 1, overflowY: 'auto', marginTop: '15px' }}>
            {searchChars.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => { closeModal(); window.scrollTo({top:0}); alert('위키 카드 위치로 앵커 이동 구현 예정'); }}>
                <span style={{ fontWeight: 900 }}>{c.name}</span><span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>이동 ➔</span>
              </div>
            ))}
          </div>
        </ModalOverlay>
      )}

      {activeModal === 'recent' && (
        <ModalOverlay title="🕒 최근 열람 기록" onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentWorks.length === 0 ? <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>목록이 없습니다.</div> : 
              recentWorks.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => { closeModal(); navigate(`/work/${w.id}`); }}>
                  <div><h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{w.title}</h4><div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>✍️ {w.creator || '미상'}</div></div>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '18px' }}>➔</span>
                </div>
              ))
            }
          </div>
        </ModalOverlay>
      )}
    </>
  );
};

export default FabMenu;
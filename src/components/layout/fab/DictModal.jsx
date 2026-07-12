import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosCore';
import ModalOverlay from './ModalOverlay';
import { useModalStore } from '../../../store/useModalStore';

const DictModal = ({ currentWorkId, showToast, globalDictList, setGlobalDictList }) => {
  const { closeModal } = useModalStore();
  const [dictInput, setDictInput] = useState({ word: '', trans: '' });
  const [dictSearch, setDictSearch] = useState('');
  const [dictBulk, setDictBulk] = useState('');
  const [isDictBulkMode, setIsDictBulkMode] = useState(false);

  const inpSty = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' };

  const handleDictAdd = async () => {
    const word = dictInput.word.trim();
    const trans = dictInput.trans.trim();
    if (!word || !trans) return alert("원문 단어와 치환 데이터를 채워넣어 주십시오.");
    
    try {
      await api.post('/api/dicts', { workId: currentWorkId, word, translation: trans });
      setGlobalDictList(prev => [...prev, { workId: currentWorkId, word, translation: trans }]);
      setDictInput({ word: '', trans: '' });
      showToast("✨ 사전 데이터베이스에 저장 완료되었습니다.");
    } catch (e) {}
  };

  const handleDictBulk = async () => {
    if (!dictBulk.trim()) return alert("텍스트 파일 블록이 공백 상태입니다.");
    const lines = dictBulk.split('\n');
    const payloads = [];
    const newDict = [...globalDictList];
    
    lines.forEach(line => {
      const match = line.trim().match(/^([^\(\)]+)\(([^\(\)]+)\)$/);
      if (match) {
        let key = match[1].trim(); let val = match[2].trim();
        if (/[가-힣]/.test(val) && !/[가-힣]/.test(key)) { key = match[2].trim(); val = match[1].trim(); }
        if (!newDict.some(d => d.word === key)) {
          newDict.push({ workId: currentWorkId, word: key, translation: val });
          payloads.push({ workId: currentWorkId, word: key, translation: val });
        }
      }
    });

    if (payloads.length > 0) {
      await api.post('/api/dicts/bulk', payloads);
      setGlobalDictList(newDict);
      setDictBulk('');
      setIsDictBulkMode(false);
      showToast(`✨ 총 ${payloads.length}개의 어휘 묶음 처리가 종료되었습니다.`);
    } else {
      alert("추출 가능한 문법 구문 패턴이 부재하거나 이미 등록된 단어들입니다.");
    }
  };

  return (
    <ModalOverlay title="📖 고유명사 한자/영문 사전" onClose={closeModal} width="550px">
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="원문" value={dictInput.word} onChange={e => setDictInput({...dictInput, word: e.target.value})} style={{...inpSty, flex: 1}} autoComplete="off" />
        <input type="text" placeholder="한자/영문" value={dictInput.trans} onChange={e => setDictInput({...dictInput, trans: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleDictAdd()} style={{...inpSty, flex: 1}} autoComplete="off" />
        <button className="wiki-btn primary-btn" onClick={handleDictAdd} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>추가</button>
        <button className="wiki-btn outline-btn gray" onClick={() => setIsDictBulkMode(!isDictBulkMode)} style={{ padding: '8px 12px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>일괄 ▾</button>
      </div>
      
      {isDictBulkMode && (
         <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
           <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>📝 다량 등록 (원문(한자) 줄바꿈 분할 매크로)</span>
           <textarea value={dictBulk} onChange={e => setDictBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }} placeholder="예시:&#13;&#10;초혼(招魂)"></textarea>
           <button className="wiki-btn primary-btn" onClick={handleDictBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚀 벌크 컴파일 덤프 가동</button>
         </div>
      )}
      
      <input type="text" placeholder="🔍 사전에 보존된 등록 데이터 실시간 매칭 검색..." value={dictSearch} onChange={e => setDictSearch(e.target.value)} style={{...inpSty, width: '100%', boxSizing: 'border-box'}} autoComplete="off" spellCheck="false" />
      
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', maxHeight: '300px' }}>
        <table className="bulk-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
          <thead style={{ background: 'var(--table-bg-alt)', position: 'sticky', top: 0, zIndex: 2 }}>
            <tr>
              <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>원문 문자열</th>
              <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>치환용 데이터</th>
              <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', width:'50px', color: 'var(--text-primary)'}}>파괴</th>
            </tr>
          </thead>
          <tbody>
            {globalDictList.filter(d => d.word.includes(dictSearch) || d.translation.includes(dictSearch)).map((d, i) => (
              <tr key={i}>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}><b>{d.word}</b></td>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color:'var(--primary-color)', fontWeight:'bold'}}>{d.translation}</td>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)'}}>
                  <button 
                    onClick={async () => { 
                      if (window.confirm(`[${d.word}] 고유 어휘를 사전에서 소각하시겠습니까?`)) {
                        await api.delete(`/api/dicts?workId=${currentWorkId}&word=${encodeURIComponent(d.word)}`); 
                        setGlobalDictList(prev => prev.filter(x => x.word !== d.word)); 
                        showToast("🗑️ 사전 색인에서 말소 처리되었습니다.");
                      }
                    }} 
                    style={{ border:'none', background:'none', color:'#e53e3e', cursor:'pointer', fontWeight:'bold', fontSize: '14px' }}
                  >✖</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModalOverlay>
  );
};

export default DictModal;
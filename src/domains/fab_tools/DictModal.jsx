// 파일 위치: src/domains/fab_tools/DictModal.jsx
// 기능 요약: 전역/로컬 고유명사 사전 관리 모달 (이모지 제거, 레이아웃 버그 픽스, 수정 기능 탑재)
// 버전: v1.5.0

import React, { useState } from 'react';
import api from '../../api/axiosCore';
import ModalOverlay from '../../components/common/ModalOverlay';
import { useModalStore } from '../../store/useModalStore';
import { IconBook, IconPlus, IconEdit, IconTrash, IconChevronDown, IconFileText, IconRocket, IconSave, IconSearch } from './components/FabIcons';

const DictModal = ({ currentWorkId, showToast, globalDictList, setGlobalDictList }) => {
  const { closeModal } = useModalStore();
  const [dictInput, setDictInput] = useState({ word: '', trans: '' });
  const [editingTarget, setEditingTarget] = useState(null); // 수정 락온 상태 관리
  const [dictSearch, setDictSearch] = useState('');
  const [dictBulk, setDictBulk] = useState('');
  const [isDictBulkMode, setIsDictBulkMode] = useState(false);

  const inpSty = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };

  // 단건 저장 및 수정 핸들러
  const handleDictSave = async () => {
    const word = dictInput.word.trim();
    const trans = dictInput.trans.trim();
    if (!word || !trans) return alert("원문 단어와 치환 데이터를 채워넣어 주십시오.");
    
    try {
      if (editingTarget) {
        // 기존 원문이나 한자가 수정되었을 가능성을 대비해 기존 데이터 먼저 핀포인트 삭제
        await api.delete(`/api/dicts?workId=${editingTarget.workId}&word=${encodeURIComponent(editingTarget.word)}&translation=${encodeURIComponent(editingTarget.translation)}`);
        setGlobalDictList(prev => prev.filter(x => !(x.word === editingTarget.word && x.translation === editingTarget.translation)));
      }
      
      await api.post('/api/dicts', { workId: currentWorkId, word, translation: trans });
      
      // 로컬 스토어 업데이트
      setGlobalDictList(prev => {
        const cleaned = prev.filter(x => !(x.word === word && x.translation === trans));
        return [...cleaned, { workId: currentWorkId, word, translation: trans }];
      });

      setDictInput({ word: '', trans: '' });
      setEditingTarget(null);
      showToast(editingTarget ? "✨ 사전 데이터가 수정되었습니다." : "✨ 사전 데이터베이스에 저장 완료되었습니다.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (d) => {
    setDictInput({ word: d.word, trans: d.translation });
    setEditingTarget(d);
    setIsDictBulkMode(false);
  };

  const handleCancelEdit = () => {
    setDictInput({ word: '', trans: '' });
    setEditingTarget(null);
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
        // 중복 방지 방어막: 완전히 동일한 쌍만 필터
        if (!newDict.some(d => d.word === key && d.translation === val)) {
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
    <ModalOverlay title={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconBook size={16} /> 고유명사 한자/영문 사전</span>} onClose={closeModal} width="550px">
      
      {/* 1. 단건 입력/수정 폼 및 레이아웃 깨짐(줄바꿈) 방지 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input type="text" placeholder="원문" value={dictInput.word} onChange={e => setDictInput({...dictInput, word: e.target.value})} style={{...inpSty, flex: 1, minWidth: 0}} autoComplete="off" />
        <input type="text" placeholder="한자/영문" value={dictInput.trans} onChange={e => setDictInput({...dictInput, trans: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleDictSave()} style={{...inpSty, flex: 1, minWidth: 0}} autoComplete="off" />
        
        {editingTarget ? (
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button className="wiki-btn" onClick={handleDictSave} style={{ whiteSpace: 'nowrap', padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><IconSave size={14} /> 저장</button>
            <button className="wiki-btn outline-btn gray" onClick={handleCancelEdit} style={{ whiteSpace: 'nowrap', padding: '8px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>취소</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button className="wiki-btn primary-btn" onClick={handleDictSave} style={{ whiteSpace: 'nowrap', padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><IconPlus size={14} /> 추가</button>
            <button className="wiki-btn outline-btn gray" onClick={() => setIsDictBulkMode(!isDictBulkMode)} style={{ whiteSpace: 'nowrap', padding: '8px 10px', background: 'var(--table-bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>일괄 <IconChevronDown size={14} /></button>
          </div>
        )}
      </div>
      
      {/* 2. 대량 등록 벌크 모드 */}
      {isDictBulkMode && (
         <div style={{ padding: '10px', background: 'rgba(59,91,219,0.05)', border: '1px dashed var(--primary-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
           <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}><IconFileText size={14} /> 다량 등록 (원문(한자) 줄바꿈 분할 매크로)</span>
           <textarea value={dictBulk} onChange={e => setDictBulk(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none', height: '80px', fontFamily: 'inherit', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }} placeholder="예시:&#13;&#10;초혼(招魂)"></textarea>
           <button className="wiki-btn primary-btn" onClick={handleDictBulk} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><IconRocket size={14} /> 벌크 컴파일 덤프 가동</button>
         </div>
      )}
      
      {/* 3. 검색 필드 */}
      <div style={{ position: 'relative', marginTop: '12px', marginBottom: '12px' }}>
        <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <IconSearch size={14} />
        </div>
        <input type="text" placeholder="사전에 보존된 등록 데이터 실시간 매칭 검색..." value={dictSearch} onChange={e => setDictSearch(e.target.value)} style={{...inpSty, width: '100%', paddingLeft: '32px', boxSizing: 'border-box'}} autoComplete="off" spellCheck="false" />
      </div>
      
      {/* 4. 데이터 리스트 및 테이블 */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', maxHeight: '300px' }}>
        <table className="bulk-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
          <thead style={{ background: 'var(--table-bg-alt)', position: 'sticky', top: 0, zIndex: 2 }}>
            <tr>
              <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>원문 문자열</th>
              <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>치환용 데이터</th>
              <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', width:'80px', color: 'var(--text-primary)'}}>관리</th>
            </tr>
          </thead>
          <tbody>
            {globalDictList.filter(d => d.word.includes(dictSearch) || d.translation.includes(dictSearch)).map((d, i) => (
              <tr key={i}>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}><b>{d.word}</b></td>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color:'var(--primary-color)', fontWeight:'bold'}}>{d.translation}</td>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)'}}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button onClick={() => handleEditClick(d)} style={{ border:'none', background:'none', color:'var(--text-secondary)', cursor:'pointer', padding: 0 }} title="수정"><IconEdit size={15} /></button>
                    <button 
                      onClick={async () => { 
                        if (window.confirm(`[${d.word}(${d.translation})] 고유 어휘 쌍을 사전에서 소각하시겠습니까?`)) {
                          await api.delete(`/api/dicts?workId=${d.workId}&word=${encodeURIComponent(d.word)}&translation=${encodeURIComponent(d.translation)}`); 
                          setGlobalDictList(prev => prev.filter(x => !(x.word === d.word && x.translation === d.translation))); 
                          showToast("🗑️ 사전 색인이 말소 처리되었습니다.");
                        }
                      }} 
                      style={{ border:'none', background:'none', color:'#e53e3e', cursor:'pointer', padding: 0 }} title="삭제"
                    ><IconTrash size={15} /></button>
                  </div>
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
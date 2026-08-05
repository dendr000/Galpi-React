// src/domains/fab_tools/SearchModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axiosCore';
import ModalOverlay from '../../components/common/ModalOverlay';
import { useModalStore } from '../../store/useModalStore';

const SearchModal = ({ currentWorkId }) => {
  const { closeModal } = useModalStore();
  const [searchChars, setSearchChars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentWorkId !== 'global') {
      api.get(`/api/characters?workId=${currentWorkId}`).then(res => setSearchChars(res.data));
    } else {
      alert("특정 작품 스페이스 상세 위키 내부로 진입하여 인물 검색망을 가동하십시오.");
      closeModal();
    }
  }, [currentWorkId, closeModal]);

  return (
    <ModalOverlay title="🔍 작중 등장인물 빠른 검색" onClose={closeModal}>
      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="인물의 고유 성명을 입력하세요..." style={{ padding: '12px', fontSize: '13px', border: '2px solid var(--primary-color)', borderRadius: '6px', width: '100%', boxSizing: 'border-box', background: 'var(--surface-color)', color: 'var(--text-primary)', outline: 'none' }} autoFocus autoComplete="off" spellCheck="false" />
      <div style={{ flex: 1, overflowY: 'auto', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px' }}>
        {searchChars.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
          <div 
            key={c.id} 
            className="modal-work-row" 
            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} 
            onClick={() => { 
              closeModal(); 
              if (window.scrollToCharacter) window.scrollToCharacter(c.name);
              else alert(`[${c.name}] 물리적 스크롤 처리를 대행할 수 없습니다.`);
            }}
          >
            <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{c.name}</span>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '13px' }}>포커스 이동 ➔</span>
          </div>
        ))}
        {searchChars.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
          <div className="modal-empty" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>부합하는 설정 카드가 부재합니다.</div>
        )}
      </div>
    </ModalOverlay>
  );
};

export default SearchModal;
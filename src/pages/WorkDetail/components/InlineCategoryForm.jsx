import React, { useState } from 'react';
import api from '../../../api/axiosCore';

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

export default InlineCategoryForm;
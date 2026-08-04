// 파일 위치: src/pages/MemoWorkspace/editor/MemoTagBar.jsx
import React, { useState } from 'react';

const MemoTagBar = ({ memoTags, setMemoTags }) => {
  const [inputValue, setInputValue] = useState('');

  const tagsArray = memoTags ? memoTags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleKeyDown = (e) => {
    // ★ 변경됨: 스페이스바(' ') 또는 Enter를 누르면 태그가 등록되도록 수정
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault(); // 스페이스바 누를 때 띄어쓰기가 입력되는 걸 막음
      const newTag = inputValue.trim().replace(/#/g, ''); 
      
      if (newTag && !tagsArray.includes(newTag)) {
        const newTagsStr = [...tagsArray, newTag].join(',');
        setMemoTags(newTagsStr);
        setInputValue('');
      } else if (tagsArray.includes(newTag)) {
        setInputValue(''); 
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTagsStr = tagsArray.filter(t => t !== tagToRemove).join(',');
    setMemoTags(newTagsStr);
  };

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', padding: '12px 20px', 
      borderTop: '1px dashed var(--border-color)', background: 'var(--bg-color)', 
      gap: '10px', flexWrap: 'wrap' 
    }}>
      <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
        🏷️ 태그
      </span>
      
      {tagsArray.map((tag, idx) => (
        <span key={idx} style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', 
          background: 'rgba(59, 91, 219, 0.1)', color: 'var(--primary-color)', 
          borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' 
        }}>
          #{tag}
          <button 
            onClick={() => handleRemoveTag(tag)} 
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--primary-color)', 
              cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1, opacity: 0.6 
            }}
            title="태그 삭제"
          >
            &times;
          </button>
        </span>
      ))}

      <input 
        type="text" 
        placeholder="태그 입력 후 스페이스바..." 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ 
          flex: 1, minWidth: '150px', border: 'none', background: 'transparent', 
          fontSize: '13px', color: 'var(--text-primary)', outline: 'none' 
        }}
      />
    </div>
  );
};

export default MemoTagBar;
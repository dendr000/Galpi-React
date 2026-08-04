// 파일 위치: src/domains/memo/components/MemoTagBar.jsx
import React, { useState } from 'react';
import { TagIcon, XIcon } from './MemoIcons'; // ★ SVG 아이콘 임포트

const MemoTagBar = ({ memoTags, setMemoTags }) => {
  const [inputValue, setInputValue] = useState('');

  const tagsArray = memoTags ? memoTags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault(); 
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
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
        <TagIcon /> 태그
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', color: 'var(--primary-color)', 
              cursor: 'pointer', padding: 0, opacity: 0.6 
            }}
            title="태그 삭제"
          >
            <XIcon size={12} />
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
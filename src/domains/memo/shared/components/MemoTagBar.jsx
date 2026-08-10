import React, { useRef } from 'react';
import { TagIcon } from './MemoIcons';

const MemoTagBar = ({ memoTags, setMemoTags }) => {
  // ★ useState 제어를 버리고 useRef 비제어 방식으로 교체하여 타이핑 씹힘 현상을 원천 차단합니다.
  const inputRef = useRef(null);

  // 쉼표(,)로 구분된 태그 문자열을 배열로 파싱
  const tagsArray = memoTags ? memoTags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleKeyDown = (e) => {
    // 한글 조합(IME) 중에는 단축키 이벤트를 가로채지 않음
    if (e.nativeEvent.isComposing) return;

    // 스페이스바 또는 엔터 입력 시 태그 생성
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // 스페이스바로 띄어쓰기가 본문에 입력되는 것을 차단
      if (!inputRef.current) return;

      const inputValue = inputRef.current.value;
      const newTag = inputValue.trim().replace(/#/g, '');

      if (newTag && !tagsArray.includes(newTag)) {
        // 새 태그를 배열에 추가하고 직렬화하여 부모 컴포넌트에 전달
        const newTagsStr = [...tagsArray, newTag].join(',');
        setMemoTags(newTagsStr);
        inputRef.current.value = ''; // 입력창 물리적 초기화
      } else if (tagsArray.includes(newTag)) {
        // 이미 존재하는 태그일 경우 입력창만 비워줌
        inputRef.current.value = ''; 
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTagsStr = tagsArray.filter(t => t !== tagToRemove).join(',');
    setMemoTags(newTagsStr);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--surface-color)', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
        <TagIcon /> 태그
      </div>
      
      {tagsArray.map((tag, idx) => (
        <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(59, 91, 219, 0.1)', color: 'var(--primary-color)', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
          #{tag}
          <button 
            onClick={() => handleRemoveTag(tag)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1, opacity: 0.6 }} 
            title="태그 삭제"
          >
            ×
          </button>
        </span>
      ))}

      {/* ★ 제어형(value, onChange) 속성을 삭제하고 물리적 렌더링(ref)에 의존하도록 수정 */}
      <input 
        type="text" 
        ref={inputRef}
        placeholder="태그 입력 후 스페이스바..." 
        onKeyDown={handleKeyDown} 
        style={{ flex: 1, minWidth: '150px', border: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }} 
      />
    </div>
  );
};

export default MemoTagBar;
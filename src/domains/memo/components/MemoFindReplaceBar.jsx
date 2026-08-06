// 파일 위치: src/domains/memo/components/MemoFindReplaceBar.jsx
// 기능 요약: 비제어 폼(useRef) 기반으로 동작하여 타이핑 렌더링 렉을 방지하는 찾아 바꾸기(Find/Replace) 제어 패널입니다.

import React, { useRef } from 'react';
import { SearchIcon } from './MemoIcons';

const MemoFindReplaceBar = ({ findText, replaceText, setFindText, setReplaceText, executeFindReplace }) => {
  const findInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const handleExecute = () => {
    if (findInputRef.current && replaceInputRef.current) {
      setFindText(findInputRef.current.value);
      setReplaceText(replaceInputRef.current.value);
      setTimeout(executeFindReplace, 50); 
    }
  };

  const btnStyle = { padding: '4px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' };

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
      <input type="text" placeholder="찾을 내용" ref={findInputRef} defaultValue={findText} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none', userSelect: 'text' }} />
      <input type="text" placeholder="바꿀 내용 (\n 줄바꿈 적용)" ref={replaceInputRef} defaultValue={replaceText} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none', userSelect: 'text' }} />
      <button className="wiki-btn" onClick={handleExecute} style={btnStyle}>
        <SearchIcon /> 일괄 변경
      </button>
    </div>
  );
};

export default MemoFindReplaceBar;
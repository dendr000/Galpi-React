// 파일 위치: src/domains/memo/components/MemoFoldControlBar.jsx
// 기능 요약: 접기 박스(Accordion) 내부에 커서가 위치할 때 활성화되는 박스 영구 삭제 전용 패널입니다.

import React from 'react';
import { TrashIcon } from './MemoIcons';

const MemoFoldControlBar = ({ delTable }) => {
  const btnStyle = { padding: '4px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' };
  
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
      <button className="wiki-btn" onClick={delTable} style={{ ...btnStyle, background: '#e53e3e', color: 'white', borderColor: '#e53e3e' }} title="접기 박스를 영구 삭제합니다 (Ctrl+Z 지원)">
        <TrashIcon /> 박스 완전히 지우기
      </button>
    </div>
  );
};

export default MemoFoldControlBar;
// 파일 위치: src/domains/memo/page/components/PageMemoFormatBar.jsx
// 기능 요약: shared로 분리된 하위 서식 제어 패널들을 조립하여 렌더링하는 툴바 컨테이너
import React from 'react';
import MemoFormatMainBar from '../../shared/components/MemoFormatMainBar';
import MemoTableControlBar from '../../shared/components/MemoTableControlBar';
import MemoFindReplaceBar from '../../shared/components/MemoFindReplaceBar';

const PageMemoFormatBar = (props) => {
  return (
    <div 
      id="page-memo-format-bar" 
      onMouseDown={(e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        e.preventDefault();
      }}
      style={{ 
        position: 'sticky', // ★ 스크롤 시 화면 상단에 찰싹 달라붙는 마법의 속성
        top: 0, 
        zIndex: 10,
        display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' 
      }}
    >
      <MemoFormatMainBar {...props} />
      {props.tableCtrlVisible && <MemoTableControlBar {...props} />}
      {props.findReplaceVisible && <MemoFindReplaceBar {...props} />}
    </div>
  );
};

export default PageMemoFormatBar;
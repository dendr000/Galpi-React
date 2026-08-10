// 파일 위치: src/domains/memo/fab/components/FabMemoFormatBar.jsx
import React from 'react';
import MemoFormatMainBar from '../../shared/components/MemoFormatMainBar';
import MemoTableControlBar from '../../shared/components/MemoTableControlBar';
import MemoFindReplaceBar from '../../shared/components/MemoFindReplaceBar';

const FabMemoFormatBar = (props) => {
  return (
    <div 
      id="memo-format-bar" 
      onMouseDown={(e) => {
        // INPUT과 SELECT는 포커스 차단 예외 처리
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        e.preventDefault();
      }}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' }}
    >
      {/* 1. 기본 서식 및 템플릿 제어 메인 툴바 */}
      <MemoFormatMainBar {...props} />

      {/* 2. 표(Table) 제어 패널 */}
      {props.tableCtrlVisible && <MemoTableControlBar {...props} />}

      {/* 3. 찾아 바꾸기 패널 */}
      {props.findReplaceVisible && <MemoFindReplaceBar {...props} />}
    </div>
  );
};

export default FabMemoFormatBar;
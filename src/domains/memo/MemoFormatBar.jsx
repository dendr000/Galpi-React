// 파일 위치: src/domains/memo/MemoFormatBar.jsx
// 기능 요약: 여러 서브 제어 패널(메인, 표, 접기 박스, 찾아바꾸기)을 조건에 따라 조합하여 보여주는 툴바 컨테이너(Wrapper)입니다.

import React from 'react';
import MemoFormatMainBar from './components/MemoFormatMainBar';
import MemoTableControlBar from './components/MemoTableControlBar';
import MemoFoldControlBar from './components/MemoFoldControlBar';
import MemoFindReplaceBar from './components/MemoFindReplaceBar';

const MemoFormatBar = (props) => {
  return (
    <div 
      id="memo-format-bar" 
      onMouseDown={(e) => {
        // ★ 픽스: INPUT뿐만 아니라 SELECT(드롭다운)도 포커스 차단 방어막에서 예외 처리
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        e.preventDefault();
      }}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' }}
    >
      {/* 1. 기본 서식 및 템플릿 제어 메인 툴바 */}
      <MemoFormatMainBar {...props} />

      {/* 2. 조건부 렌더링: 표(Table) 제어 패널 */}
      {props.tableCtrlVisible === 'table' && <MemoTableControlBar {...props} />}

      {/* 3. 조건부 렌더링: 접기 박스(Accordion) 제어 패널 */}
      {props.tableCtrlVisible === 'fold' && <MemoFoldControlBar {...props} />}

      {/* 4. 조건부 렌더링: 찾아 바꾸기 패널 */}
      {props.findReplaceVisible && <MemoFindReplaceBar {...props} />}
    </div>
  );
};

export default MemoFormatBar;
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
        // INPUT과 SELECT는 툴바 내부 포커스 차단 예외 처리
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        e.preventDefault();
      }}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' }}
    >
      {/* 1. 기본 서식 및 템플릿 제어 메인 툴바 (shared 재활용) */}
      <MemoFormatMainBar {...props} />

      {/* 2. 표 제어 패널 (shared 재활용) */}
      {props.tableCtrlVisible && <MemoTableControlBar {...props} />}

      {/* 3. 찾아 바꾸기 패널 (shared 재활용) */}
      {props.findReplaceVisible && <MemoFindReplaceBar {...props} />}
    </div>
  );
};

export default PageMemoFormatBar;
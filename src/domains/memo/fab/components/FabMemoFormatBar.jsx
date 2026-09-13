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

      {/* 2. 표(Table) 제어 패널 — 표가 있으면 자리를 항상 미리 확보해두고(visibility만 토글)
          처음 표 칸 클릭 시 컨트롤바 마운트로 인한 레이아웃 시프트(한글 조합 깨짐 버그의 원인)를
          막는다. 자세한 배경은 useTableFocus.js 참고. */}
      {props.hasTable && (
        <div style={{ visibility: props.tableCtrlVisible ? 'visible' : 'hidden' }}>
          <MemoTableControlBar {...props} />
        </div>
      )}

      {/* 3. 찾아 바꾸기 패널 */}
      {props.findReplaceVisible && <MemoFindReplaceBar {...props} />}
    </div>
  );
};

export default FabMemoFormatBar;
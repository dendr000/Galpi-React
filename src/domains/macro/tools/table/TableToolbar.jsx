// 절대 경로: src/domains/macro/tools/table/TableToolbar.jsx
// 기능 요약: 표 구조 제어 및 텍스트 서식을 관리하며 시각적 버튼 디자인이 대폭 강화된 순수 SVG 기반 툴바 컴포넌트 v1.1.0

import React from 'react';

// 외부 라이브러리를 대체하는 순수 인라인 SVG 아이콘 모음
const IconRowUp = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V7m-7 7l7-7 7 7M3 3h18"/></svg>;
const IconRowDown = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v14m-7-7l7 7 7-7M3 21h18"/></svg>;
const IconColLeft = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12H7m7-7l-7 7 7 7M3 3v18"/></svg>;
const IconColRight = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h14m-7-7l7 7-7 7M21 3v18"/></svg>;
const IconTrash = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>;
const IconMergeRight = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M12 3v18M12 12h9M16 8l4 4-4 4"/></svg>;
const IconMergeDown = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 12h18M12 12v9M8 16l4 4 4-4"/></svg>;
const IconSplit = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M12 3v18M3 12h18"/></svg>;
const IconAlignLeft = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
const IconAlignCenter = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>;
const IconAlignRight = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>;
const IconBold = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>;
const IconItalic = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const IconStrike = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 00-2.83 4"/><path d="M14 12a4 4 0 010 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>;
const IconEraser = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20H7L3 16a2 2 0 010-2.83l9-9a2 2 0 012.83 0l4 4a2 2 0 010 2.83L14 15"/><path d="M18 11l-5 5"/></svg>;
const IconUndo = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H11"/></svg>;
const IconHeaderCol = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16" fill="none"/><rect x="3" y="4" width="6" height="16" fill="currentColor" stroke="none" opacity="0.35"/></svg>;
const IconHeaderRow = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18" fill="none"/><rect x="3" y="4" width="18" height="6" fill="currentColor" stroke="none" opacity="0.35"/></svg>;
const IconRedo = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 004 14.5v0A5.5 5.5 0 009.5 20H13"/></svg>;

function TableToolbar({
  grid, focusedCell, selectedCellKeys,
  insertCount, setInsertCount,
  insertRowAbove, insertRowBelow, insertColLeft, insertColRight,
  deleteFocusedRow, deleteFocusedCol,
  mergeRight, mergeDown, unmerge,
  undo, redo, canUndo, canRedo,
  toggleFormat, toggleHeaderCol, toggleRowHeader, handleAlignChange, clearFormatting, handleCellChange
}) {
  console.log("[TableToolbar] 컴포넌트 렌더링 됨");

  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasActiveArea = !!activeCell || (selectedCellKeys && selectedCellKeys.length > 0);
  const isMerged = activeCell ? (activeCell.rowSpan > 1 || activeCell.colSpan > 1) : false;
  // 0번 행이 옵트아웃(<nr>) 되지 않은 이상 계속 헤더이므로, 포커스와 무관하게 0번 행 기준으로 판단
  const isRowHeaderOn = grid.length > 0 && grid[0].some(c => c && !c.noRowHeader);

  // 텍스트를 드래그로 부분 선택한 상태에서 서식 버튼을 누르면 선택된 부분만 마커로 감싸고,
  // 선택 없이 누르면 예전처럼 셀 전체 토글로 동작한다 — 부분 굵게/기울임/취소선을 지원하기 위함.
  // 버튼에 onMouseDown={e => e.preventDefault()}를 같이 걸어둬야 클릭해도 textarea 포커스가
  // 안 풀려서 selectionStart/End가 살아있다.
  const wrapSelectionOrToggle = (formatType, marker) => {
    const active = document.activeElement;
    if (active && active.tagName === 'TEXTAREA' && active.selectionStart !== active.selectionEnd && focusedCell) {
      const start = active.selectionStart, end = active.selectionEnd;
      const text = active.value;
      const selected = text.substring(start, end);
      const newText = text.substring(0, start) + marker + selected + marker + text.substring(end);
      handleCellChange(focusedCell.r, focusedCell.c, newText);
      requestAnimationFrame(() => {
        active.focus();
        active.setSelectionRange(start + marker.length, end + marker.length);
      });
    } else {
      toggleFormat(formatType);
    }
  };

  const containerStyle = {
    display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 16px',
    backgroundColor: 'var(--surface-color, #f6f8fa)', border: '1px solid var(--border-color, #d0d7de)', borderRadius: '8px', marginBottom: '16px'
  };
  const rowStyle = { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' };
  const groupStyle = { display: 'flex', alignItems: 'center', gap: '6px' };
  const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary, #57606a)', marginRight: '4px' };
  const dividerStyle = { width: '1px', height: '24px', backgroundColor: 'var(--border-color, #d0d7de)', margin: '0 4px' };
  
  // 기능: 활성화 여부에 따라 윤곽선, 배경색, 그림자 효과를 적용하여 명확한 버튼 형태를 갖추도록 CSS 수정
  const getBtnStyle = (isActive, disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
    padding: '6px 10px', cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isActive ? 'var(--table-bg-alt, #e8f0fe)' : '#ffffff',
    border: '1px solid', borderColor: isActive ? 'var(--primary-color, #0969da)' : '#d0d7de',
    borderRadius: '6px', 
    color: disabled ? '#a1aab3' : (isActive ? 'var(--primary-color, #0969da)' : 'var(--text-primary, #24292f)'),
    boxShadow: disabled ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
    fontSize: '13px',
    transition: 'all 0.15s ease-in-out',
    opacity: disabled ? 0.6 : 1
  });

  return (
    <div style={containerStyle}>
      {/* 1열: 구조 제어 및 병합 */}
      <div style={rowStyle}>
        <div style={groupStyle}>
          <span style={labelStyle}>구조:</span>
          <input 
            type="number" 
            min="1" max="50" 
            value={insertCount} 
            onChange={(e) => setInsertCount(Number(e.target.value))} 
            title="한 번에 삽입할 행/열의 개수"
            style={{ width: '48px', height: '28px', textAlign: 'center', border: '1px solid #d0d7de', borderRadius: '6px', outline: 'none', marginRight: '4px' }}
          />
          <button type="button" onClick={insertRowAbove} disabled={!hasActiveArea} title="위로 행 삽입" style={getBtnStyle(false, !hasActiveArea)}><IconRowUp /></button>
          <button type="button" onClick={insertRowBelow} disabled={!hasActiveArea} title="아래로 행 삽입" style={getBtnStyle(false, !hasActiveArea)}><IconRowDown /></button>
          <button type="button" onClick={insertColLeft} disabled={!hasActiveArea} title="좌측으로 열 삽입" style={getBtnStyle(false, !hasActiveArea)}><IconColLeft /></button>
          <button type="button" onClick={insertColRight} disabled={!hasActiveArea} title="우측으로 열 삽입" style={getBtnStyle(false, !hasActiveArea)}><IconColRight /></button>
          
          <div style={dividerStyle} />
          
          <button type="button" onClick={deleteFocusedRow} disabled={!hasActiveArea} title="행 삭제" style={{ ...getBtnStyle(false, !hasActiveArea), color: !hasActiveArea ? '#a1aab3' : '#e53e3e' }}><IconTrash /> 행</button>
          <button type="button" onClick={deleteFocusedCol} disabled={!hasActiveArea} title="열 삭제" style={{ ...getBtnStyle(false, !hasActiveArea), color: !hasActiveArea ? '#a1aab3' : '#e53e3e' }}><IconTrash /> 열</button>
        </div>

        <div style={dividerStyle} />

        <div style={groupStyle}>
          <span style={labelStyle}>병합:</span>
          <button type="button" onClick={mergeRight} disabled={!activeCell} title="오른쪽 칸과 병합" style={getBtnStyle(false, !activeCell)}><IconMergeRight /></button>
          <button type="button" onClick={mergeDown} disabled={!activeCell} title="아래쪽 칸과 병합" style={getBtnStyle(false, !activeCell)}><IconMergeDown /></button>
          <button type="button" onClick={unmerge} disabled={!isMerged} title="병합 해제" style={getBtnStyle(false, !isMerged)}><IconSplit /></button>
        </div>

        <div style={dividerStyle} />

        <div style={groupStyle}>
          <span style={labelStyle}>헤더:</span>
          <button type="button" onClick={toggleRowHeader} disabled={grid.length === 0} title="맨 위 행을 헤더로 지정/해제" style={getBtnStyle(isRowHeaderOn, grid.length === 0)}><IconHeaderRow /> 행</button>
          <button type="button" onClick={toggleHeaderCol} disabled={!activeCell} title="포커스된 칸이 속한 열 전체를 헤더로 지정/해제" style={getBtnStyle(activeCell?.headCol, !activeCell)}><IconHeaderCol /> 열</button>
        </div>

        <div style={{ marginLeft: 'auto', ...groupStyle }}>
          <button type="button" onClick={undo} disabled={!canUndo} title="실행 취소" style={getBtnStyle(false, !canUndo)}><IconUndo /></button>
          <button type="button" onClick={redo} disabled={!canRedo} title="다시 실행" style={getBtnStyle(false, !canRedo)}><IconRedo /></button>
        </div>
      </div>

      {/* 2열: 정렬 및 텍스트 서식 제어 */}
      <div style={rowStyle}>
        <div style={groupStyle}>
          <span style={labelStyle}>정렬:</span>
          <button type="button" onClick={() => handleAlignChange('left')} disabled={!hasActiveArea} title="왼쪽 정렬" style={getBtnStyle(activeCell?.align === 'left', !hasActiveArea)}><IconAlignLeft /></button>
          <button type="button" onClick={() => handleAlignChange('center')} disabled={!hasActiveArea} title="가운데 정렬" style={getBtnStyle(activeCell?.align === 'center', !hasActiveArea)}><IconAlignCenter /></button>
          <button type="button" onClick={() => handleAlignChange('right')} disabled={!hasActiveArea} title="오른쪽 정렬" style={getBtnStyle(activeCell?.align === 'right', !hasActiveArea)}><IconAlignRight /></button>
        </div>

        <div style={dividerStyle} />

        <div style={groupStyle}>
          <span style={labelStyle}>서식:</span>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => wrapSelectionOrToggle('bold', '~')} disabled={!hasActiveArea} title="굵게 (일부만 선택하면 선택한 부분만 적용)" style={getBtnStyle(activeCell?.bold, !hasActiveArea)}><IconBold /></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => wrapSelectionOrToggle('italic', '_')} disabled={!hasActiveArea} title="기울임 (일부만 선택하면 선택한 부분만 적용)" style={getBtnStyle(activeCell?.italic, !hasActiveArea)}><IconItalic /></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => wrapSelectionOrToggle('strike', '--')} disabled={!hasActiveArea} title="취소선 (일부만 선택하면 선택한 부분만 적용)" style={getBtnStyle(activeCell?.strike, !hasActiveArea)}><IconStrike /></button>
          
          <div style={dividerStyle} />
          
          <button type="button" onClick={clearFormatting} disabled={!hasActiveArea} title="모든 서식 지우기" style={getBtnStyle(false, !hasActiveArea)}><IconEraser /></button>
        </div>
      </div>
    </div>
  );
}

export default TableToolbar;
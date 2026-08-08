// 절대 경로: src/domains/macro/tools/table/TableToolbar.jsx
// 기능 요약: 표 구조 제어(행/열 추가 및 삭제, 병합), 텍스트 서식(정렬, 굵게 등), 히스토리(실행 취소)를 관리하는 순수 SVG 기반 툴바 컴포넌트 v1.0.0

import React from 'react';

// 외부 라이브러리(lucide-react 등)를 대체하는 순수 인라인 SVG 아이콘 모음
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
const IconRedo = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 004 14.5v0A5.5 5.5 0 009.5 20H13"/></svg>;

function TableToolbar({
  grid, focusedCell, selectedCellKeys,
  insertCount, setInsertCount,
  insertRowAbove, insertRowBelow, insertColLeft, insertColRight,
  deleteFocusedRow, deleteFocusedCol,
  mergeRight, mergeDown, unmerge,
  undo, redo, canUndo, canRedo,
  toggleFormat, handleAlignChange, clearFormatting
}) {
  console.log("[TableToolbar] 컴포넌트 렌더링 됨");

  // 현재 포커스 된 셀 정보를 추출하여 버튼 활성화 여부 판별
  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasActiveArea = !!activeCell || (selectedCellKeys && selectedCellKeys.length > 0);
  const isMerged = activeCell ? (activeCell.rowSpan > 1 || activeCell.colSpan > 1) : false;

  // 인라인 스타일 객체 (기존 CSS 파일 의존도를 낮추고 안정성을 확보하기 위해 정의)
  const containerStyle = {
    display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px',
    backgroundColor: 'var(--surface-color, #f6f8fa)', border: '1px solid var(--border-color, #d0d7de)', borderRadius: '6px', marginBottom: '16px'
  };
  const rowStyle = { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' };
  const groupStyle = { display: 'flex', alignItems: 'center', gap: '4px' };
  const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', marginRight: '4px' };
  const dividerStyle = { width: '1px', height: '20px', backgroundColor: 'var(--border-color, #d0d7de)', margin: '0 4px' };
  
  // 상태에 따른 동적 인라인 스타일(active 클래스 백업)
  const getBtnStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px', cursor: 'pointer',
    backgroundColor: isActive ? 'var(--border-color, #d0d7de)' : 'transparent',
    border: '1px solid', borderColor: isActive ? '#8c959f' : 'transparent',
    borderRadius: '4px', color: 'var(--text-primary)'
  });

  return (
    <div style={containerStyle}>
      {/* 1열: 구조 제어 및 병합 */}
      <div style={rowStyle}>
        <div style={groupStyle}>
          <span style={labelStyle}>구조:</span>
          {/* 다중 삽입 개수 컨트롤 */}
          <input 
            type="number" 
            min="1" max="50" 
            value={insertCount} 
            onChange={(e) => setInsertCount(Number(e.target.value))} 
            title="한 번에 삽입할 행/열의 개수"
            style={{ width: '48px', height: '28px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none' }}
          />
          <button className="wiki-btn" onClick={insertRowAbove} disabled={!hasActiveArea} title="위로 행 삽입" style={getBtnStyle(false)}><IconRowUp /></button>
          <button className="wiki-btn" onClick={insertRowBelow} disabled={!hasActiveArea} title="아래로 행 삽입" style={getBtnStyle(false)}><IconRowDown /></button>
          <button className="wiki-btn" onClick={insertColLeft} disabled={!hasActiveArea} title="좌측으로 열 삽입" style={getBtnStyle(false)}><IconColLeft /></button>
          <button className="wiki-btn" onClick={insertColRight} disabled={!hasActiveArea} title="우측으로 열 삽입" style={getBtnStyle(false)}><IconColRight /></button>
          
          <div style={dividerStyle} />
          
          <button className="wiki-btn" onClick={deleteFocusedRow} disabled={!hasActiveArea} title="행 삭제" style={{ ...getBtnStyle(false), color: '#e53e3e' }}><IconTrash /> 행</button>
          <button className="wiki-btn" onClick={deleteFocusedCol} disabled={!hasActiveArea} title="열 삭제" style={{ ...getBtnStyle(false), color: '#e53e3e' }}><IconTrash /> 열</button>
        </div>

        <div style={dividerStyle} />

        <div style={groupStyle}>
          <span style={labelStyle}>병합:</span>
          <button className="wiki-btn" onClick={mergeRight} disabled={!activeCell} title="오른쪽 칸과 병합" style={getBtnStyle(false)}><IconMergeRight /></button>
          <button className="wiki-btn" onClick={mergeDown} disabled={!activeCell} title="아래쪽 칸과 병합" style={getBtnStyle(false)}><IconMergeDown /></button>
          <button className="wiki-btn" onClick={unmerge} disabled={!isMerged} title="병합 해제" style={getBtnStyle(false)}><IconSplit /></button>
        </div>
        
        <div style={{ marginLeft: 'auto', ...groupStyle }}>
          <button className="wiki-btn" onClick={undo} disabled={!canUndo} title="실행 취소" style={getBtnStyle(false)}><IconUndo /></button>
          <button className="wiki-btn" onClick={redo} disabled={!canRedo} title="다시 실행" style={getBtnStyle(false)}><IconRedo /></button>
        </div>
      </div>

      {/* 2열: 정렬 및 텍스트 서식 제어 */}
      <div style={rowStyle}>
        <div style={groupStyle}>
          <span style={labelStyle}>정렬:</span>
          <button className={`wiki-btn ${activeCell?.align === 'left' ? 'active' : ''}`} onClick={() => handleAlignChange('left')} disabled={!hasActiveArea} title="왼쪽 정렬" style={getBtnStyle(activeCell?.align === 'left')}><IconAlignLeft /></button>
          <button className={`wiki-btn ${activeCell?.align === 'center' ? 'active' : ''}`} onClick={() => handleAlignChange('center')} disabled={!hasActiveArea} title="가운데 정렬" style={getBtnStyle(activeCell?.align === 'center')}><IconAlignCenter /></button>
          <button className={`wiki-btn ${activeCell?.align === 'right' ? 'active' : ''}`} onClick={() => handleAlignChange('right')} disabled={!hasActiveArea} title="오른쪽 정렬" style={getBtnStyle(activeCell?.align === 'right')}><IconAlignRight /></button>
        </div>

        <div style={dividerStyle} />

        <div style={groupStyle}>
          <span style={labelStyle}>서식:</span>
          <button className={`wiki-btn ${activeCell?.bold ? 'active' : ''}`} onClick={() => toggleFormat('bold')} disabled={!hasActiveArea} title="굵게" style={getBtnStyle(activeCell?.bold)}><IconBold /></button>
          <button className={`wiki-btn ${activeCell?.italic ? 'active' : ''}`} onClick={() => toggleFormat('italic')} disabled={!hasActiveArea} title="기울임" style={getBtnStyle(activeCell?.italic)}><IconItalic /></button>
          <button className={`wiki-btn ${activeCell?.strike ? 'active' : ''}`} onClick={() => toggleFormat('strike')} disabled={!hasActiveArea} title="취소선" style={getBtnStyle(activeCell?.strike)}><IconStrike /></button>
          
          <div style={dividerStyle} />
          
          <button className="wiki-btn" onClick={clearFormatting} disabled={!hasActiveArea} title="모든 서식 지우기" style={getBtnStyle(false)}><IconEraser /></button>
        </div>
      </div>
    </div>
  );
}

export default TableToolbar;
// 파일 위치: src/components/layout/fab/memo/MemoFormatBar.jsx
// 기능 요약: 텍스트 에디터 서식 제어 및 하이퍼링크 SVG 버튼 UI 레이아웃

import React from 'react';
import {
  BoldIcon, ItalicIcon, StrikethroughIcon, FootnoteIcon, TableIcon, TodoIcon, FoldIcon, SearchIcon,
  RowPlusIcon, ColPlusIcon, RowMinusIcon, ColMinusIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon,
  HeadingToggleIcon, WidthFitIcon, TrashIcon, LinkIcon
} from './components/MemoIcons';

const MemoFormatBar = ({
  executeCmd, insertHtml, tableCtrlVisible, setTableCtrlVisible,
  addTableRowBelow, addTableColRight, delTableRow, delTableCol, delTable,
  setCellAlign, toggleHeaderRow, setCellBgColor, toggleTableWidth,
  findReplaceVisible, setFindReplaceVisible, findText, setFindText,
  replaceText, setReplaceText, executeFindReplace, insertFootnote, insertMarkdownLink
}) => {
  const svgClose = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const svgPlay = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;

  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none; display:flex; align-items:center; justify-content:center;" title="삭제">${svgClose}</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const tableHTML = `<table style="width:max-content; min-width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); word-break:break-all; margin: 15px 0;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px; resize:horizontal; overflow:hidden;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px; resize:horizontal; overflow:hidden;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px; resize:horizontal; overflow:hidden;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px; resize:horizontal; overflow:hidden;">내용2</td></tr></tbody></table><div><br></div>`;
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:11px; font-weight:bold; z-index:10; display:flex; align-items:center; gap:4px;">${svgClose} 박스 삭제</button><details style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none; display:flex; align-items:center; gap:8px;"><span style="display:flex; align-items:center; justify-content:center;">${svgPlay}</span><span contenteditable="true" style="outline:none;">펼쳐보기 (클릭하여 제목 수정)</span></summary><div contenteditable="true" style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none;">숨길 내용을 입력하세요...</div></details></div><div><br></div>`;

  const PASTEL_COLORS = [
    { label: '지우기', val: 'transparent', bg: '#f1f3f5' },
    { label: '노랑', val: '#fff3bf', bg: '#fff3bf' },
    { label: '주황', val: '#ffe8cc', bg: '#ffe8cc' },
    { label: '핑크', val: '#ffb8b8', bg: '#ffb8b8' },
    { label: '보라', val: '#e5dbff', bg: '#e5dbff' },
    { label: '파랑', val: '#d0ebff', bg: '#d0ebff' },
    { label: '초록', val: '#d3f9d8', bg: '#d3f9d8' }
  ];

  const btnStyle = { padding: '4px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' };
  const iconBtnStyle = { ...btnStyle, padding: '4px 6px' };

  return (
    <div id="memo-format-bar" style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="wiki-btn" onClick={() => executeCmd('bold')} style={iconBtnStyle} title="굵게 (Ctrl+B)">
          <BoldIcon />
        </button>
        <button className="wiki-btn" onClick={() => executeCmd('italic')} style={iconBtnStyle} title="기울임 (Ctrl+I)">
          <ItalicIcon />
        </button>
        <button className="wiki-btn" onClick={() => executeCmd('strikeThrough')} style={iconBtnStyle} title="취소선">
          <StrikethroughIcon />
        </button>
        
        <button className="wiki-btn" onClick={insertFootnote} style={iconBtnStyle} title="각주 삽입 (Ctrl+Q)">
          <FootnoteIcon />
        </button>

        {/* ★ 하이퍼링크 삽입 버튼 추가 */}
        <button className="wiki-btn" onClick={insertMarkdownLink} style={iconBtnStyle} title="링크 삽입 (Alt+W)">
          <LinkIcon />
        </button>

        <button className="wiki-btn" onClick={() => insertHtml(tableHTML)} style={btnStyle} title="표 삽입">
          <TableIcon /> 표 삽입
        </button>
        <button className="wiki-btn" onClick={() => insertHtml(checkHTML)} style={btnStyle} title="할 일 삽입">
          <TodoIcon /> 할 일
        </button>
        <button className="wiki-btn" onClick={() => insertHtml(foldHTML)} style={btnStyle} title="접기 박스 삽입">
          <FoldIcon /> 접기 박스
        </button>
        <button className="wiki-btn" onClick={() => { setFindReplaceVisible(!findReplaceVisible); setTableCtrlVisible(false); }} style={btnStyle} title="찾아 바꾸기">
          <SearchIcon /> 찾기/바꾸기
        </button>
      </div>

      {tableCtrlVisible && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="wiki-btn" onClick={addTableRowBelow} style={btnStyle} title="아래에 행 추가">
              <RowPlusIcon /> 행 추가
            </button>
            <button className="wiki-btn" onClick={addTableColRight} style={btnStyle} title="우측에 열 추가">
              <ColPlusIcon /> 열 추가
            </button>
            <button className="wiki-btn" onClick={delTableRow} style={{ ...btnStyle, color: '#e53e3e', borderColor: 'rgba(229,62,62,0.3)' }} title="현재 행 삭제">
              <RowMinusIcon /> 행 삭제
            </button>
            <button className="wiki-btn" onClick={delTableCol} style={{ ...btnStyle, color: '#e53e3e', borderColor: 'rgba(229,62,62,0.3)' }} title="현재 열 삭제">
              <ColMinusIcon /> 열 삭제
            </button>
            
            <div style={{ width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 4px' }}></div>
            
            <button className="wiki-btn" onClick={() => setCellAlign('left')} title="왼쪽 정렬" style={iconBtnStyle}>
              <AlignLeftIcon />
            </button>
            <button className="wiki-btn" onClick={() => setCellAlign('center')} title="가운데 정렬" style={iconBtnStyle}>
              <AlignCenterIcon />
            </button>
            <button className="wiki-btn" onClick={() => setCellAlign('right')} title="오른쪽 정렬" style={iconBtnStyle}>
              <AlignRightIcon />
            </button>
            
            <div style={{ width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 4px' }}></div>
            
            <button className="wiki-btn" onClick={toggleHeaderRow} title="제목 행 속성으로 변경/해제" style={btnStyle}>
              <HeadingToggleIcon /> 제목행 토글
            </button>
            <button className="wiki-btn" onClick={toggleTableWidth} title="100% 꽉 채우기 / 내용 너비 맞춤" style={btnStyle}>
              <WidthFitIcon /> 너비 맞춤
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>배경색:</span>
            {PASTEL_COLORS.map((c) => (
              <button 
                key={c.label} title={c.label} onClick={() => setCellBgColor(c.val)}
                style={{ width: '16px', height: '16px', background: c.bg, border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer', padding: 0 }}
              />
            ))}
            <button className="wiki-btn" onClick={delTable} style={{ ...btnStyle, background: '#e53e3e', color: 'white', borderColor: '#e53e3e', marginLeft: 'auto' }} title="표 완전히 지우기">
              <TrashIcon /> 표 완전히 지우기
            </button>
          </div>
        </div>
      )}

      {findReplaceVisible && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
          <input type="text" placeholder="찾을 내용" value={findText} onChange={e => setFindText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
          <input type="text" placeholder="바꿀 내용 (\n 줄바꿈 적용)" value={replaceText} onChange={e => setReplaceText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
          <button className="wiki-btn" onClick={executeFindReplace} style={btnStyle}>
            <SearchIcon /> 일괄 변경
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoFormatBar;
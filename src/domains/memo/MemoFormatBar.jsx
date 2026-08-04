// 파일 위치: src/components/layout/fab/memo/MemoFormatBar.jsx
import React from 'react';

const MemoFormatBar = ({
  executeCmd, insertHtml, tableCtrlVisible, setTableCtrlVisible,
  addTableRowBelow, addTableColRight, delTableRow, delTableCol, delTable,
  setCellAlign, toggleHeaderRow, setCellBgColor, toggleTableWidth,
  findReplaceVisible, setFindReplaceVisible, findText, setFindText,
  replaceText, setReplaceText, executeFindReplace, insertFootnote
}) => {
  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none;" title="삭제">✖</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const tableHTML = `<table style="width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); table-layout:auto; margin: 15px 0;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용2</td></tr></tbody></table><div><br></div>`;
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold; z-index:10;">❌ 박스 삭제</button><details style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none;"><span>▶</span> <span contenteditable="true" style="outline:none;">펼쳐보기 (클릭하여 제목 수정)</span></summary><div contenteditable="true" style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none;">숨길 내용을 입력하세요...</div></details></div><div><br></div>`;

  const PASTEL_COLORS = [
    { label: '지우기', val: 'transparent', bg: '#f1f3f5' },
    { label: '노랑', val: '#fff3bf', bg: '#fff3bf' },
    { label: '주황', val: '#ffe8cc', bg: '#ffe8cc' },
    { label: '핑크', val: '#ffb8b8', bg: '#ffb8b8' },
    { label: '보라', val: '#e5dbff', bg: '#e5dbff' },
    { label: '파랑', val: '#d0ebff', bg: '#d0ebff' },
    { label: '초록', val: '#d3f9d8', bg: '#d3f9d8' }
  ];

  return (
    <div id="memo-format-bar" style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' }}>
      
      {/* 1. 기본 마크다운 및 서식 툴바 */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="wiki-btn" onClick={() => executeCmd('bold')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>B</button>
        <button className="wiki-btn" onClick={() => executeCmd('italic')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>I</button>
        <button className="wiki-btn" onClick={() => executeCmd('strikeThrough')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>S</button>
        
        <button className="wiki-btn" onClick={insertFootnote} title="각주 삽입 (Ctrl+Q)" style={{ padding: '3px 6px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </button>

        <button className="wiki-btn" onClick={() => insertHtml(tableHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>📊 표 삽입</button>
        <button className="wiki-btn" onClick={() => insertHtml(checkHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>☑️ 할 일</button>
        <button className="wiki-btn" onClick={() => insertHtml(foldHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>▼ 접기 박스</button>
        <button className="wiki-btn" onClick={() => { setFindReplaceVisible(!findReplaceVisible); setTableCtrlVisible(false); }} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>🔍 찾기/바꾸기</button>
      </div>

      {/* 2. 표 제어 컨트롤러 툴바 (구조 및 서식 제어) */}
      {tableCtrlVisible && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="wiki-btn" onClick={addTableRowBelow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 행 추가</button>
            <button className="wiki-btn" onClick={addTableColRight} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 열 추가</button>
            <button className="wiki-btn" onClick={delTableRow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 행 삭제</button>
            <button className="wiki-btn" onClick={delTableCol} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 열 삭제</button>
            
            <div style={{ width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 4px' }}></div>
            
            <button className="wiki-btn" onClick={() => setCellAlign('left')} title="왼쪽 정렬" style={{ padding: '3px 6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px' }}>⬅️</button>
            <button className="wiki-btn" onClick={() => setCellAlign('center')} title="가운데 정렬" style={{ padding: '3px 6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px' }}>↔️</button>
            <button className="wiki-btn" onClick={() => setCellAlign('right')} title="오른쪽 정렬" style={{ padding: '3px 6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px' }}>➡️</button>
            
            <div style={{ width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 4px' }}></div>
            
            <button className="wiki-btn" onClick={toggleHeaderRow} title="제목 행 속성으로 변경/해제" style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>📝 제목행 토글</button>
            <button className="wiki-btn" onClick={toggleTableWidth} title="100% 꽉 채우기 / 내용 너비 맞춤" style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>📐 너비 맞춤</button>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>배경색:</span>
            {PASTEL_COLORS.map((c) => (
              <button 
                key={c.label} title={c.label} onClick={() => setCellBgColor(c.val)}
                style={{ width: '16px', height: '16px', background: c.bg, border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer', padding: 0 }}
              />
            ))}
            <button className="wiki-btn" onClick={delTable} style={{ padding: '3px 8px', background: '#e53e3e', color: 'white', border: '1px solid #e53e3e', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', marginLeft: 'auto' }}>❌ 표 완전히 지우기</button>
          </div>
        </div>
      )}

      {/* 3. 찾아 바꾸기 패널 */}
      {findReplaceVisible && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
          <input type="text" placeholder="찾을 내용" value={findText} onChange={e => setFindText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
          <input type="text" placeholder="바꿀 내용 (\n 줄바꿈 적용)" value={replaceText} onChange={e => setReplaceText(e.target.value)} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
          <button className="wiki-btn" onClick={executeFindReplace} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>일괄 변경</button>
        </div>
      )}
    </div>
  );
};

export default MemoFormatBar;
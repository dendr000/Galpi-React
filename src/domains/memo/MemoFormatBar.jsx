// 파일 위치: src/components/layout/fab/memo/MemoFormatBar.jsx
// 기능 요약: FAB 메모장의 텍스트 서식, 표/체크박스 생성, 표 동적 조작 및 찾기/바꾸기 UI를 담당하는 툴바 컴포넌트

import React from 'react';

const MemoFormatBar = ({
  executeCmd,
  insertHtml,
  tableCtrlVisible,
  setTableCtrlVisible,
  addTableRowBelow,
  addTableColRight,
  delTableRow,
  delTableCol,
  findReplaceVisible,
  setFindReplaceVisible,
  findText,
  setFindText,
  replaceText,
  setReplaceText,
  executeFindReplace
}) => {
  // 체크박스 마크다운 정합성 복원용 기본 템플릿
  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none;" title="삭제">✖</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const tableHTML = `<div style="position:relative; margin:15px 0; border:1px solid transparent; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold;">❌ 표 완전히 지우기</button><table contenteditable="true" style="width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); table-layout:auto;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용2</td></tr></tbody></table></div><div><br></div>`;
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold; z-index:10;">❌ 박스 삭제</button><details style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none;"><span>▶</span> <span contenteditable="true" style="outline:none;">펼쳐보기 (클릭하여 제목 수정)</span></summary><div contenteditable="true" style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none;">숨길 내용을 입력하세요...</div></details></div><div><br></div>`;

  return (
    <div id="memo-format-bar" style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '6px 10px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="wiki-btn" onClick={() => executeCmd('bold')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>B</button>
        <button className="wiki-btn" onClick={() => executeCmd('italic')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>I</button>
        <button className="wiki-btn" onClick={() => executeCmd('strikeThrough')} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>S</button>
        <button className="wiki-btn" onClick={() => insertHtml(tableHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>📊 표 삽입</button>
        <button className="wiki-btn" onClick={() => insertHtml(checkHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>☑️ 할 일</button>
        <button className="wiki-btn" onClick={() => insertHtml(foldHTML)} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>▼ 접기 박스</button>
        <button className="wiki-btn" onClick={() => { setFindReplaceVisible(!findReplaceVisible); setTableCtrlVisible(false); }} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>🔍 찾기/바꾸기</button>
      </div>

      {tableCtrlVisible && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
          <button className="wiki-btn" onClick={addTableRowBelow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 아래에 행 추가</button>
          <button className="wiki-btn" onClick={addTableColRight} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 우측에 열 추가</button>
          <button className="wiki-btn" onClick={delTableRow} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 행 삭제</button>
          <button className="wiki-btn" onClick={delTableCol} style={{ padding: '3px 8px', background: 'var(--bg-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 열 삭제</button>
        </div>
      )}

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
// 파일 위치: src/pages/MemoWorkspace/editor/MemoFormatBar.jsx
// 기능 요약: 리치 텍스트 에디터의 서식 지정, 표 제어, 매크로 삽입, 찾기/바꾸기 UI를 담당하는 툴바 컴포넌트
// 버전: v1.0.0

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
  executeFindReplace,
  checkHTML,
  tableHTML,
  foldHTML
}) => {
  console.log("[MemoFormatBar] 에디터 포맷 툴바 렌더링");

  return (
    <div id="memo-format-bar" style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--table-bg-alt)', borderBottom: '1px solid var(--border-color)', userSelect: 'none', padding: '8px 20px', boxSizing: 'border-box' }}>
      
      {/* 1. 기본 서식 및 매크로 버튼 그룹 */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="wiki-btn" onClick={() => executeCmd('bold')} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>B</button>
        <button className="wiki-btn" onClick={() => executeCmd('italic')} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>I</button>
        <button className="wiki-btn" onClick={() => executeCmd('strikeThrough')} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>S</button>
        <button className="wiki-btn" onClick={() => insertHtml(tableHTML)} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>📊 표 삽입</button>
        <button className="wiki-btn" onClick={() => insertHtml(checkHTML)} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>☑️ 할 일</button>
        <button className="wiki-btn" onClick={() => insertHtml(foldHTML)} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>▼ 접기 박스</button>
        <button className="wiki-btn" onClick={() => { setFindReplaceVisible(!findReplaceVisible); setTableCtrlVisible(false); }} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>🔍 찾기/바꾸기</button>
      </div>

      {/* 2. 표 제어 컨트롤러 (표 내부 클릭 시 활성화) */}
      {tableCtrlVisible && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
          <button className="wiki-btn" onClick={addTableRowBelow} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 아래에 행 추가</button>
          <button className="wiki-btn" onClick={addTableColRight} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➕ 우측에 열 추가</button>
          <button className="wiki-btn" onClick={delTableRow} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 행 삭제</button>
          <button className="wiki-btn" onClick={delTableCol} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>➖ 현재 열 삭제</button>
        </div>
      )}

      {/* 3. 찾기 및 바꾸기 패널 */}
      {findReplaceVisible && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
          <input type="text" placeholder="찾을 내용" value={findText} onChange={e => setFindText(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
          <input type="text" placeholder="바꿀 내용 (\n 줄바꿈 적용)" value={replaceText} onChange={e => setReplaceText(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1, outline: 'none' }} />
          <button className="wiki-btn" onClick={executeFindReplace} style={{ padding: '4px 10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>일괄 변경</button>
        </div>
      )}
    </div>
  );
};

export default MemoFormatBar;
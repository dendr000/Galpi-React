// 파일 위치: src/pages/MemoWorkspace/WorkspaceEditorModal.jsx
// 기능 요약: 비즈니스 로직을 모두 useWorkspaceEditor 훅으로 분리하고 UI 마크업만 남긴 경량화 모달
// 버전: v2.0.0

import React from 'react';
import MemoFormatBar from './editor/MemoFormatBar';
import MemoEditorHeader from './editor/MemoEditorHeader';
import MentionDropdown from './editor/MentionDropdown';
import { useWorkspaceEditor } from './editor/useWorkspaceEditor';

const WorkspaceEditorModal = (props) => {
  console.log("[WorkspaceEditorModal] 리치 텍스트 에디터 UI 렌더링 개시");

  // ★ 커스텀 훅을 통해 모든 비즈니스 로직과 상태를 한 번에 주입받음
  const editorHooks = useWorkspaceEditor(props);
  const {
    editorRef, titleRef, charCount, isSaving, tableCtrlVisible, setTableCtrlVisible,
    findReplaceVisible, setFindReplaceVisible, findText, setFindText, replaceText, setReplaceText,
    selectedColor, setSelectedColor, mentionCandidates, mentionState,
    handleSaveMemo, handleDeleteMemo, handleMentionSelect, handleTitleKeyDown,
    handleEditorKeyDown, handleEditorKeyUp, handleCopy, handleEditorClick, checkTableFocus,
    executeCmd, insertHtml, executeFindReplace, addTableRowBelow, addTableColRight,
    delTableRow, delTableCol, updateCharCount
  } = editorHooks;

  // 에디터 툴바에 주입할 상용구 매크로 HTML
  const checkHTML = `<div style="display:flex; align-items:center; gap:8px; margin:4px 0;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#e53e3e; border:none; cursor:pointer; font-size:14px; padding:0; outline:none;" title="삭제">✖</button><input type="checkbox" style="cursor:pointer; width:16px; height:16px;"><span contenteditable="true" style="outline:none; flex:1; font-size:13px; min-width:50px;">할 일 입력...</span></div>`;
  const tableHTML = `<div style="position:relative; margin:15px 0; border:1px solid transparent; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold;">❌ 표 완전히 지우기</button><table contenteditable="true" style="width:100%; border-collapse:collapse; text-align:center; font-size:13px; background:var(--surface-color); table-layout:auto;"><tbody><tr><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목1</th><th style="border:1px solid var(--border-color); padding:10px; background:var(--table-bg-alt); color:var(--primary-color); min-width:60px;">제목2</th></tr><tr><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용1</td><td style="border:1px solid var(--border-color); padding:10px; min-width:60px;">내용2</td></tr></tbody></table></div><div><br></div>`;
  const foldHTML = `<div style="position:relative; margin:15px 0; padding-top:15px;" contenteditable="false"><button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:#e53e3e; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px; font-weight:bold; z-index:10;">❌ 박스 삭제</button><details style="border: 1px solid var(--border-color); border-radius: 8px; background: var(--table-bg-alt); overflow: hidden; font-size:13px;"><summary style="padding: 10px 15px; font-weight: 900; cursor: pointer; color: var(--primary-color); outline: none; list-style:none;"><span>▶</span> <span contenteditable="true" style="outline:none;">펼쳐보기 (클릭하여 제목 수정)</span></summary><div contenteditable="true" style="padding: 15px; border-top: 1px dashed var(--border-color); line-height: 1.6; background: var(--surface-color); outline:none;">숨길 내용을 입력하세요...</div></details></div><div><br></div>`;

  return (
    <div className="modal-overlay" style={{ zIndex: 100000, display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onMouseDown={() => props.setIsEditorOpen(false)}>
      
      <MentionDropdown 
        mentionState={mentionState} 
        mentionCandidates={mentionCandidates} 
        handleMentionSelect={handleMentionSelect} 
      />

      <div className="modal-content" style={{ width: '1000px', maxWidth: '95vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', borderTop: `4px solid ${selectedColor}` }} onMouseDown={e => e.stopPropagation()}>
        
        <MemoEditorHeader 
          titleRef={titleRef} editData={props.editData} setEditData={props.setEditData}
          charCount={charCount} selectedColor={selectedColor} setSelectedColor={setSelectedColor}
          folders={props.folders} isSaving={isSaving} handleSaveMemo={handleSaveMemo}
          activeMemoId={props.activeMemoId} handleDeleteMemo={handleDeleteMemo}
          setIsEditorOpen={props.setIsEditorOpen} handleTitleKeyDown={handleTitleKeyDown}
        />

        <MemoFormatBar 
          executeCmd={executeCmd} insertHtml={insertHtml}
          tableCtrlVisible={tableCtrlVisible} setTableCtrlVisible={setTableCtrlVisible}
          addTableRowBelow={addTableRowBelow} addTableColRight={addTableColRight}
          delTableRow={delTableRow} delTableCol={delTableCol}
          findReplaceVisible={findReplaceVisible} setFindReplaceVisible={setFindReplaceVisible}
          findText={findText} setFindText={setFindText} replaceText={replaceText} setReplaceText={setReplaceText}
          executeFindReplace={executeFindReplace} checkHTML={checkHTML} tableHTML={tableHTML} foldHTML={foldHTML}
        />

        <div 
          id="memo-edit-content" ref={editorRef} contentEditable="true" spellCheck="false"
          style={{ flex: 1, overflowY: 'auto', outline: 'none', padding: '30px', background: 'var(--bg-color)', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)' }}
          onInput={updateCharCount} onClick={handleEditorClick} 
          onKeyUp={handleEditorKeyUp} 
          onMouseUp={() => { checkTableFocus(); updateCharCount(); }}
          onKeyDown={handleEditorKeyDown} onCopy={handleCopy}
        />
      </div>
    </div>
  );
};

export default WorkspaceEditorModal;
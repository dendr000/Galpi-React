// 파일 위치: src/components/layout/fab/memo/MemoEditor.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoEditor } from './hooks/useMemoEditor';
import MemoEditorHeader from './MemoEditorHeader';
import MemoFormatBar from './MemoFormatBar';
import MemoFootnotePopover from './components/MemoFootnotePopover';

const MemoEditor = (props) => {
  const navigate = useNavigate();
  const editorHooks = useMemoEditor(props);

  if (!props.activeMemo) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
        좌측에서 메모를 선택하거나 생성하세요.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative' }}>
      
      <MemoFootnotePopover {...editorHooks.footnoteHooks} />

      <MemoEditorHeader 
        titleRef={editorHooks.titleRef}
        handleTitleKeyDown={editorHooks.handleTitleKeyDown}
        charCount={editorHooks.charCount}
        navigate={navigate}
        saveMemo={editorHooks.saveMemo}
        isSaving={editorHooks.isSaving}
      />

      <MemoFormatBar 
        executeCmd={editorHooks.executeCmd}
        insertHtml={editorHooks.insertHtml}
        tableCtrlVisible={editorHooks.tableCtrlVisible}
        setTableCtrlVisible={editorHooks.setTableCtrlVisible}
        addTableRowBelow={editorHooks.addTableRowBelow}
        addTableColRight={editorHooks.addTableColRight}
        delTableRow={editorHooks.delTableRow}
        delTableCol={editorHooks.delTableCol}
        findReplaceVisible={editorHooks.findReplaceVisible}
        setFindReplaceVisible={editorHooks.setFindReplaceVisible}
        findText={editorHooks.findText}
        setFindText={editorHooks.setFindText}
        replaceText={editorHooks.replaceText}
        setReplaceText={editorHooks.setReplaceText}
        executeFindReplace={editorHooks.executeFindReplace}
        insertFootnote={editorHooks.footnoteHooks.insertFootnote}
      />

      {/* ★ 메모가 렌더링될 때 센서가 완벽하게 몸체에 박히도록 React 이벤트로 위임 */}
      <div 
        id="memo-edit-content"
        ref={editorHooks.editorRef}
        contentEditable="true"
        spellCheck="false"
        style={{ flex: 1, overflowY: 'auto', outline: 'none', padding: '20px', background: 'var(--bg-color)', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}
        onInput={editorHooks.updateCharCount}
        onClick={editorHooks.handleEditorClick}
        onMouseUp={() => { editorHooks.checkTableFocus(); editorHooks.updateCharCount(); }}
        onKeyUp={() => { editorHooks.checkTableFocus(); editorHooks.updateCharCount(); }}
        onKeyDown={editorHooks.handleEditorKeyDown}
        onCopy={editorHooks.handleCopy}
        onMouseOver={editorHooks.footnoteHooks.handleMouseOver}
        onMouseOut={editorHooks.footnoteHooks.handleMouseOut}
      />
    </div>
  );
};

export default MemoEditor;
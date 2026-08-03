// 파일 위치: src/components/layout/fab/memo/MemoEditor.jsx
// 기능 요약: 훅과 하위 UI들을 조립하여 최종적으로 보여주는 FAB 메모장의 메인 렌더링 컨테이너

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoEditor } from './hooks/useMemoEditor';
import MemoEditorHeader from './MemoEditorHeader';
import MemoFormatBar from './MemoFormatBar';

const MemoEditor = (props) => {
  const navigate = useNavigate();
  
  // ★ 비즈니스 로직과 상태 관리를 전담하는 커스텀 훅 인젝션
  const editorHooks = useMemoEditor(props);

  if (!props.activeMemo) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
        좌측에서 메모를 선택하거나 생성하세요.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
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
      />

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
      />
    </div>
  );
};

export default MemoEditor;
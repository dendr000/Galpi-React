// 파일 위치: src/components/layout/fab/memo/MemoEditor.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoEditor } from './hooks/useMemoEditor'; // ★ 상대 경로 완벽 수정 적용 완료
import MemoEditorHeader from './MemoEditorHeader';
import MemoFormatBar from './MemoFormatBar';
import MemoFootnotePopover from './components/MemoFootnotePopover';
import MemoEditorBody from './components/MemoEditorBody';

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
        delTable={editorHooks.delTable}
        setCellAlign={editorHooks.setCellAlign}
        toggleHeaderRow={editorHooks.toggleHeaderRow}
        setCellBgColor={editorHooks.setCellBgColor}
        toggleTableWidth={editorHooks.toggleTableWidth}
        findReplaceVisible={editorHooks.findReplaceVisible}
        setFindReplaceVisible={editorHooks.setFindReplaceVisible}
        findText={editorHooks.findText}
        setFindText={editorHooks.setFindText}
        replaceText={editorHooks.replaceText}
        setReplaceText={editorHooks.setReplaceText}
        executeFindReplace={editorHooks.executeFindReplace}
        insertFootnote={editorHooks.footnoteHooks.insertFootnote}
      />

      <MemoEditorBody editorHooks={editorHooks} />
      
    </div>
  );
};

export default MemoEditor;
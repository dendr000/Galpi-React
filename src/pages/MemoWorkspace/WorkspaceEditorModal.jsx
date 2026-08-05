import React from 'react';
import { useNavigate } from 'react-router-dom'; // ★ 네비게이트 임포트
import MemoFormatBar from './editor/MemoFormatBar';
import MemoEditorHeader from './editor/MemoEditorHeader';
import MentionDropdown from './editor/MentionDropdown';
import MemoTagBar from './editor/MemoTagBar';
import { useWorkspaceEditor } from './editor/useWorkspaceEditor';

const WorkspaceEditorModal = (props) => {
  console.log("[WorkspaceEditorModal] 리치 텍스트 에디터 UI 렌더링 개시");
  const navigate = useNavigate();

  // ★ props에 navigate 병합하여 주입
  const editorHooks = useWorkspaceEditor({ ...props, navigate });

  const {
    editorRef, titleRef, charCount, isSaving, tableCtrlVisible, setTableCtrlVisible,
    findReplaceVisible, setFindReplaceVisible, findText, setFindText, replaceText, setReplaceText,
    selectedColor, setSelectedColor, mentionCandidates, mentionState,
    handleSaveMemo, handleDeleteMemo, handleMentionSelect, handleTitleKeyDown,
    handleEditorKeyDown, handleEditorKeyUp, handleCopy, handleEditorClick, checkTableFocus,
    executeCmd, insertHtml, executeFindReplace, addTableRowBelow, addTableColRight,
    delTableRow, delTableCol, updateCharCount, insertMarkdownLink
  } = editorHooks;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      
      <MemoEditorHeader 
        titleRef={titleRef}
        handleTitleKeyDown={handleTitleKeyDown}
        charCount={charCount}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        isSaving={isSaving}
        handleSaveMemo={handleSaveMemo}
        handleDeleteMemo={handleDeleteMemo}
        setIsEditorOpen={props.setIsEditorOpen}
      />

      <MemoFormatBar 
        executeCmd={executeCmd}
        insertHtml={insertHtml}
        tableCtrlVisible={tableCtrlVisible}
        setTableCtrlVisible={setTableCtrlVisible}
        addTableRowBelow={addTableRowBelow}
        addTableColRight={addTableColRight}
        delTableRow={delTableRow}
        delTableCol={delTableCol}
        delTable={delTable}
        setCellAlign={setCellAlign}
        toggleHeaderRow={toggleHeaderRow}
        setCellBgColor={setCellBgColor}
        toggleTableWidth={toggleTableWidth}
        findReplaceVisible={findReplaceVisible}
        setFindReplaceVisible={setFindReplaceVisible}
        findText={findText}
        setFindText={setFindText}
        replaceText={replaceText}
        setReplaceText={setReplaceText}
        executeFindReplace={executeFindReplace}
        insertMarkdownLink={insertMarkdownLink}
      />

      <div 
        style={{ flex: 1, overflowY: 'auto', padding: '0', position: 'relative' }} 
        className="galpi-sidebar-scroll"
        onClick={handleEditorClick}
      >
        <div
          id="memo-edit-content"
          ref={editorRef}
          contentEditable={true}
          onKeyDown={handleEditorKeyDown}
          onKeyUp={handleEditorKeyUp}
          onCopy={handleCopy}
          onInput={updateCharCount}
          style={{ padding: '30px', minHeight: '100%', outline: 'none', fontSize: '14px', lineHeight: 1.8, color: 'var(--text-primary)' }}
        />
        
        <MentionDropdown 
          isOpen={mentionState.isOpen}
          x={mentionState.x}
          y={mentionState.y}
          query={mentionState.query}
          candidates={mentionCandidates}
          onSelect={handleMentionSelect}
          onClose={() => editorHooks.setMentionState(prev => ({ ...prev, isOpen: false }))}
        />
      </div>

      <MemoTagBar memoTags={editorHooks.memoTags} setMemoTags={editorHooks.setMemoTags} />

    </div>
  );
};

export default WorkspaceEditorModal;
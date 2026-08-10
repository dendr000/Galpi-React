import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MemoTagBar from '../shared/components/MemoTagBar';
import PageMemoEditorHeader from './components/PageMemoEditorHeader';
import PageMemoFormatBar from './components/PageMemoFormatBar';
import PageMemoMentionDropdown from './components/PageMemoMentionDropdown';
import { usePageMemoEditor } from './hooks/usePageMemoEditor';

const PageMemoEditorPane = (props) => {
  const navigate = useNavigate();
  const editorHooks = usePageMemoEditor({ ...props, navigate });
  
  // ★ 읽기 전용(보기 모드) 스위칭 상태
  const [isReadOnly, setIsReadOnly] = useState(false);

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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative', overflow: 'hidden', height: '100%' }}>
      
      <PageMemoEditorHeader 
        titleRef={titleRef}
        handleTitleKeyDown={handleTitleKeyDown}
        charCount={charCount}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        folders={props.folders}
        editData={props.editData}
        setEditData={props.setEditData}
        isSaving={isSaving}
        handleSaveMemo={handleSaveMemo}
        activeMemoId={props.activeMemoId}
        handleDeleteMemo={handleDeleteMemo}
        handleCloseTab={(e) => props.handleCloseTab(e, props.activeMemoId, props.paneType)}
        isReadOnly={isReadOnly}        // ★ 상태 주입
        setIsReadOnly={setIsReadOnly}  // ★ 상태 변경 함수 주입
      />

      {/* ★ 읽기 전용 모드일 때는 서식 툴바 렌더링 생략 */}
      {!isReadOnly && (
        <PageMemoFormatBar 
          executeCmd={executeCmd}
          insertHtml={insertHtml}
          tableCtrlVisible={tableCtrlVisible}
          setTableCtrlVisible={setTableCtrlVisible}
          addTableRowBelow={addTableRowBelow}
          addTableColRight={addTableColRight}
          delTableRow={delTableRow}
          delTableCol={delTableCol}
          findReplaceVisible={findReplaceVisible}
          setFindReplaceVisible={setFindReplaceVisible}
          findText={findText}
          setFindText={setFindText}
          replaceText={replaceText}
          setReplaceText={setReplaceText}
          executeFindReplace={executeFindReplace}
          insertMarkdownLink={insertMarkdownLink}
        />
      )}

      <div 
        style={{ flex: 1, overflowY: 'auto', padding: '0', position: 'relative' }} 
        className="galpi-sidebar-scroll"
        onClick={!isReadOnly ? handleEditorClick : undefined} // 보기 모드면 클릭 포커스 차단
      >
        <div
          id="memo-edit-content"
          ref={editorRef}
          contentEditable={isReadOnly ? "false" : "true"} // ★ 읽기 모드면 입력을 완벽히 차단
          onKeyDown={!isReadOnly ? handleEditorKeyDown : undefined}
          onKeyUp={!isReadOnly ? handleEditorKeyUp : undefined}
          onCopy={handleCopy}
          onInput={updateCharCount}
          style={{ padding: '30px', minHeight: '100%', outline: 'none', fontSize: '14px', lineHeight: 1.8, color: 'var(--text-primary)' }}
        />
        
        {!isReadOnly && (
          <PageMemoMentionDropdown 
            mentionState={mentionState}
            mentionCandidates={mentionCandidates}
            handleMentionSelect={handleMentionSelect}
          />
        )}
      </div>

      <MemoTagBar memoTags={editorHooks.memoTags} setMemoTags={editorHooks.setMemoTags} />
    </div>
  );
};

export default PageMemoEditorPane;
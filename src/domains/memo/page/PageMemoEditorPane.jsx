// 파일 위치: src/domains/memo/page/PageMemoEditorPane.jsx
// 기능 요약: 탭 시스템 내부에 렌더링되며, 헤더의 탭 닫기 호출 시 자신의 패널 타입(paneType)을 정확히 전달하는 에디터 본체
import React from 'react';
import { useNavigate } from 'react-router-dom';

import MemoFormatMainBar from '../shared/components/MemoFormatMainBar';
import MemoTagBar from '../shared/components/MemoTagBar';

import PageMemoEditorHeader from './components/PageMemoEditorHeader';
import PageMemoFormatBar from './components/PageMemoFormatBar';
import PageMemoMentionDropdown from './components/PageMemoMentionDropdown';
import { usePageMemoEditor } from './hooks/usePageMemoEditor';

const PageMemoEditorPane = (props) => {
  const navigate = useNavigate();

  const editorHooks = usePageMemoEditor({ ...props, navigate });

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
        handleCloseTab={(e) => props.handleCloseTab(e, props.activeMemoId, props.paneType)} // ★ 패널 타입 동반 전달
      />

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
        
        <PageMemoMentionDropdown 
          mentionState={mentionState}
          mentionCandidates={mentionCandidates}
          handleMentionSelect={handleMentionSelect}
        />
      </div>

      <MemoTagBar memoTags={editorHooks.memoTags} setMemoTags={editorHooks.setMemoTags} />
    </div>
  );
};

export default PageMemoEditorPane;
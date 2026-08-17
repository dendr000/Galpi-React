// 파일 위치: src/domains/memo/page/PageMemoEditorPane.jsx
// 기능 요약: 1서클 마법사의 '무한 팽창' 꼼수를 삭제하고 가로 스크롤을 완벽히 차단하여 글자가 정상적으로 줄바꿈되도록 교정한 에디터 패널
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative', overflow: 'hidden', height: '100%', minWidth: 0 }}>
      
      <PageMemoEditorHeader 
        titleRef={titleRef}
        handleTitleKeyDown={handleTitleKeyDown}
        charCount={charCount}
        folders={props.folders}
        editData={props.editData}
        setEditData={props.setEditData}
        isSaving={isSaving}
        handleSaveMemo={handleSaveMemo}
        activeMemoId={props.activeMemoId}
        handleDeleteMemo={handleDeleteMemo}
        handleCloseTab={props.handleCloseTab}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
        paneType={props.paneType}
      />

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

      {/* ★ 가로 스크롤 절대 금지 (overflow-x: hidden) 및 세로 스크롤만 허용 */}
      <div 
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0', position: 'relative' }} 
        className="galpi-sidebar-scroll"
        onClick={!isReadOnly ? handleEditorClick : undefined}
      >
        {/* ★ 무한히 늘어나던 max-content 삭제 -> width: 100% 꽉 채우고 자연스럽게 줄바꿈(pre-wrap, break-word) 발동 */}
        <div
          id="memo-edit-content"
          ref={editorRef}
          contentEditable={isReadOnly ? "false" : "true"}
          onKeyDown={!isReadOnly ? handleEditorKeyDown : undefined}
          onKeyUp={!isReadOnly ? handleEditorKeyUp : undefined}
          onCopy={handleCopy}
          onInput={updateCharCount}
          style={{ 
            padding: '30px', 
            minHeight: '100%', 
            width: '100%', 
            boxSizing: 'border-box', 
            outline: 'none', 
            fontSize: '14px', 
            lineHeight: 1.8, 
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',       // 띄어쓰기/엔터 유지하되 벽에 닿으면 줄바꿈
            wordBreak: 'break-word'       // 긴 단어나 URL도 벽에 닿으면 무조건 강제 줄바꿈
          }}
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
// 파일 위치: src/domains/memo/page/PageMemoEditorModal.jsx
// 기능 요약: 뷰어 화면 전체를 덮거나 중앙에 띄워지는 페이지 도메인용 독립 에디터 모달 컨테이너 (shared 컴포넌트 결합)
// 버전: v2.1.0

import React from 'react';
import { useNavigate } from 'react-router-dom';

// ★ 공통 UI 모듈 재활용 (shared)
import MemoFormatMainBar from '../shared/components/MemoFormatMainBar';
import MemoTagBar from '../shared/components/MemoTagBar';

// 페이지 도메인 전용 하위 UI 및 훅
import PageMemoEditorHeader from './components/PageMemoEditorHeader';
import PageMemoFormatBar from './components/PageMemoFormatBar';
import PageMemoMentionDropdown from './components/PageMemoMentionDropdown';
import { usePageMemoEditor } from './hooks/usePageMemoEditor';

const PageMemoEditorModal = (props) => {
  console.log("[PageMemoEditorModal] 리치 텍스트 에디터 UI 렌더링 개시");
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      
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
        setIsEditorOpen={props.setIsEditorOpen}
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

      {/* shared 모듈에 있는 공통 태그 바 렌더링 */}
      <MemoTagBar memoTags={editorHooks.memoTags} setMemoTags={editorHooks.setMemoTags} />

    </div>
  );
};

export default PageMemoEditorModal;
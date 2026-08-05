// 파일 위치: src/domains/memo/MemoEditor.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoEditor } from './hooks/useMemoEditor'; 
import { useMemoBlockDrag } from './hooks/useMemoBlockDrag';
import MemoEditorHeader from './MemoEditorHeader';
import MemoFormatBar from './MemoFormatBar';
import MemoFootnotePopover from './components/MemoFootnotePopover';
import MemoEditorBody from './components/MemoEditorBody';
import MemoTagBar from './components/MemoTagBar';
import TagSearchModal from './components/TagSearchModal'; 

const MemoEditor = (props) => {
  const navigate = useNavigate();
  const editorHooks = useMemoEditor(props);
  const [searchTagModal, setSearchTagModal] = useState(null);

  // 물리 엔진을 컴포넌트에 마운트하여 센서를 활성화시킵니다.
  useMemoBlockDrag({
    editorRef: editorHooks.editorRef,
    updateCharCount: editorHooks.updateCharCount,
    saveMemo: editorHooks.saveMemo
  });

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
      
      <MemoTagBar 
        memoTags={editorHooks.memoTags} 
        setMemoTags={editorHooks.setMemoTags} 
        onTagClick={(tag) => setSearchTagModal(tag)} 
      />

      {searchTagModal && (
        <TagSearchModal 
          tag={searchTagModal}
          memoData={props.memoData}
          onClose={() => setSearchTagModal(null)}
          onSelectMemo={props.setActiveMemoId}
        />
      )}

    </div>
  );
};

export default MemoEditor;
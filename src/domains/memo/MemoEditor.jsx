import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoEditor } from './hooks/useMemoEditor'; 
import MemoEditorHeader from './MemoEditorHeader';
import MemoFormatBar from './MemoFormatBar';
import MemoFootnotePopover from './components/MemoFootnotePopover';
import MemoLinkPopover from './components/MemoLinkPopover';
import MemoEditorBody from './components/MemoEditorBody';
import MemoTagBar from './components/MemoTagBar';
import BoilerplateSuggestPopup from '../fab_tools/BoilerplateSuggestPopup';
import MemoBookmarkModal from './components/MemoBookmarkModal';

const MemoEditor = (props) => {
  const navigate = useNavigate();
  const editorHooks = useMemoEditor({ ...props, navigate });

  if (!props.activeMemo) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
        좌측에서 메모를 선택하거나 생성하세요.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative' }}>
      
      <MemoBookmarkModal 
        isOpen={editorHooks.bookmarkHooks.isBookmarkModalOpen}
        bookmarks={editorHooks.bookmarkHooks.bookmarks}
        onClose={editorHooks.bookmarkHooks.closeBookmarkModal}
        onNavigate={editorHooks.bookmarkHooks.scrollToBookmark}
      />

      <BoilerplateSuggestPopup 
        popupState={editorHooks.bpPopupState}
        commitBpExpansion={editorHooks.commitBpExpansion}
        updatePopupState={editorHooks.updatePopupState}
      />

      <MemoFootnotePopover {...editorHooks.footnoteHooks} />
      <MemoLinkPopover {...editorHooks.linkHooks} />

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
        insertMarkdownLink={editorHooks.insertMarkdownLink}
        openTemplateList={editorHooks.openTemplateList} 
        saveAsTemplate={editorHooks.saveAsTemplate}
        fontList={editorHooks.fontList} 
        applyFont={editorHooks.applyFont}
      />

      <MemoEditorBody editorHooks={editorHooks} />
      
      <MemoTagBar 
        memoTags={editorHooks.memoTags} 
        setMemoTags={editorHooks.setMemoTags} 
      />

    </div>
  );
};

export default MemoEditor;
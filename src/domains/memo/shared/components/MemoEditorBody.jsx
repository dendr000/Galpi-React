// 파일 위치: src/domains/memo/components/MemoEditorBody.jsx
import React from 'react';

const MemoEditorBody = ({ editorHooks }) => {
  return (
    <div 
      id="memo-edit-content" 
      ref={editorHooks.editorRef} 
      contentEditable="true" 
      spellCheck="false" 
      style={{ 
        flex: 1, 
        overflow: 'auto', // 가로세로 팽창 허용
        outline: 'none', 
        padding: '20px', 
        background: 'var(--bg-color)', 
        fontSize: '14px', 
        lineHeight: 1.6, 
        color: 'var(--text-primary)' 
      }}
      onInput={editorHooks.updateCharCount} 
      onClick={editorHooks.handleEditorClick} 
      onMouseUp={() => { 
        if(editorHooks.checkTableFocus) editorHooks.checkTableFocus(); 
        if(editorHooks.updateCharCount) editorHooks.updateCharCount(); 
      }}
      onKeyUp={(e) => { 
        if(editorHooks.checkTableFocus) editorHooks.checkTableFocus(); 
        if(editorHooks.updateCharCount) editorHooks.updateCharCount();
        if(editorHooks.handleEditorKeyUp) editorHooks.handleEditorKeyUp(e);
      }}
      onKeyDown={editorHooks.handleEditorKeyDown} 
      onCopy={editorHooks.handleCopy}
    />
  );
};

export default MemoEditorBody;
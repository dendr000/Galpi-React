// 파일 위치: src/components/layout/fab/memo/components/MemoEditorBody.jsx
// 기능 요약: ContentEditable 기반의 실제 텍스트 입력 구역을 렌더링하고 DOM 물리 이벤트를 감지하는 컨테이너
// 버전: v1.0.0
import React from 'react';

const MemoEditorBody = ({ editorHooks }) => {
  return (
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
      onMouseOver={editorHooks.footnoteHooks.handleMouseOver}
      onMouseOut={editorHooks.footnoteHooks.handleMouseOut}
    />
  );
};

export default MemoEditorBody;
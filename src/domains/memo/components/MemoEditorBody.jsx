// 파일 위치: src/components/layout/fab/memo/components/MemoEditorBody.jsx
// 기능 요약: ContentEditable 기반의 실제 텍스트 입력 구역을 렌더링하고 DOM 물리 이벤트를 감지하는 컨테이너
// 버전: v1.1.0 (누락된 Ctrl+A 시각적 은폐 CSS 글로벌 인젝션 복구)
import React, { useEffect } from 'react';

const MemoEditorBody = ({ editorHooks }) => {

  // ★ 픽스: 분리 시 누락되었던 시각적 격리 CSS 글로벌 인젝션 (표, 아코디언 직접 타겟팅)
  useEffect(() => {
    if (!document.getElementById('memo-selection-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-selection-styles';
      style.innerHTML = `
        .galpi-outer-select table, .galpi-outer-select details { opacity: 0.4; filter: grayscale(100%); transition: 0.2s; pointer-events: none; }
        .galpi-outer-select table *::selection, .galpi-outer-select details *::selection { background: transparent !important; color: inherit !important; }
        .galpi-outer-select table *::-moz-selection, .galpi-outer-select details *::-moz-selection { background: transparent !important; color: inherit !important; }
        #memo-edit-content p { margin: 0.3em 0 !important; }
        #memo-edit-content div { margin-top: 0; margin-bottom: 0; }
      `;
      document.head.appendChild(style);
    }
  }, []);

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
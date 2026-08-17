// 파일 위치: src/domains/memo/components/MemoEditorBody.jsx
import React, { useEffect } from 'react';

const MemoEditorBody = ({ editorHooks }) => {
  // ★ 위젯이든 모달이든 에디터가 마운트될 때 무조건 1회 실행되어 전역 방어막을 칩니다.
  useEffect(() => {
    if (!document.getElementById('memo-editor-global-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-editor-global-styles';
      style.innerHTML = `
        /* 선택 영역 및 문단 여백 교정 */
        .galpi-outer-select [contenteditable="false"] { opacity: 0.4; filter: grayscale(100%); transition: 0.2s; }
        .galpi-outer-select [contenteditable="false"] *::selection { background: transparent !important; color: inherit !important; }
        .galpi-outer-select [contenteditable="false"] *::-moz-selection { background: transparent !important; color: inherit !important; }
        #memo-edit-content p { margin: 0.3em 0 !important; }
        #memo-edit-content div { margin-top: 0; margin-bottom: 0; }
        .memo-move-item { padding:8px 12px; font-size:12px; cursor:pointer; transition:0.2s; font-weight:bold; color:var(--text-primary); }
        .memo-move-item:hover { background:var(--table-bg-alt); color:var(--primary-color); }
        
        /* ★ 표 무한 팽창 방지 및 강제 줄바꿈 족쇄 */
        #memo-edit-content table { 
          max-width: 100% !important; 
          table-layout: auto !important;
        }
        #memo-edit-content th, #memo-edit-content td { 
          white-space: pre-wrap !important; 
          word-break: break-word !important; 
        }
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
      style={{ 
        flex: 1, 
        overflowY: 'auto',       // ★ 세로 스크롤만 허용
        overflowX: 'hidden',     // ★ 가로 스크롤 및 팽창 원천 차단
        outline: 'none', 
        padding: '20px', 
        background: 'var(--bg-color)', 
        fontSize: '14px', 
        lineHeight: 1.6, 
        color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap',  // ★ 띄어쓰기를 보존하되 벽에 닿으면 줄바꿈
        wordBreak: 'break-word', // ★ 긴 단어나 URL 강제 줄바꿈
        overflowWrap: 'anywhere'
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
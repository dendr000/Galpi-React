// 절대 경로: src/pages/Editor/components/EditorWritePane.jsx
// 기능 요약: 텍스트 입력과 서식 단축키를 처리하고 스크롤 튐 방지가 적용된 메인 편집 패널
import React, { useEffect, useCallback } from 'react';
import styles from '../EditorPage.module.css';
import EditorToolbar from './EditorToolbar';

const EditorWritePane = ({
  docType, title, setTitle, rawText, setRawText, editorRef, handleEditorKeyDown
}) => {

  // 내부 서식 단축키(Ctrl+B, Ctrl+I 등) 적용을 위한 로직
  const applyTextFormat = useCallback((prefix, suffix) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const before = text.substring(Math.max(0, start - prefix.length), start);
    const after = text.substring(end, end + suffix.length);

    let isUnwrap = (before === prefix && after === suffix);
    let newInsertedText = isUnwrap ? selected : prefix + selected + suffix;

    setRawText(text.substring(0, isUnwrap ? start - prefix.length : start) + newInsertedText + text.substring(isUnwrap ? end + suffix.length : end));

    setTimeout(() => {
      textarea.focus();
      if (isUnwrap) {
        textarea.setSelectionRange(start - prefix.length, start - prefix.length + selected.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }
    }, 0);
  }, [editorRef, setRawText]);

  const handleLocalKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); applyTextFormat('**', '**'); break;
        case 'i': e.preventDefault(); applyTextFormat('_', '_'); break;
        default: break;
      }
    }
    if (handleEditorKeyDown) handleEditorKeyDown(e);
  };

  const adjustTextareaHeight = useCallback((element) => {
    if (element) {
      // ★ X축(가로)과 Y축(세로) 스크롤 좌표를 모두 캡처
      const currentScrollX = window.scrollX;
      const currentScrollY = window.scrollY;
      
      element.style.setProperty('height', 'auto', 'important');
      const targetHeight = element.scrollHeight + 5;
      element.style.setProperty('height', targetHeight + 'px', 'important');
      
      // ★ 가로(X)를 0으로 강제 리셋하지 않고 원래 위치 그대로 완벽 복원
      window.scrollTo(currentScrollX, currentScrollY);
    }
  }, []);

  useEffect(() => {
    if (editorRef?.current) {
      adjustTextareaHeight(editorRef.current);
    }
  }, [rawText, adjustTextareaHeight, editorRef]);

  return (
    <div className={styles.writePane} style={{ paddingLeft: '80px', boxSizing: 'border-box', maxWidth: '100%', display: 'block' }}>
      <input 
        className={styles.editorTitleInput} 
        placeholder="제목을 입력하세요" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
      />

      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', marginTop: '10px' }}>
        {docType === 'work' ? '설정 및 본문' : '문서 내용 작성'}
      </label>

      {/* SVG 아이콘이 적용된 서식 툴바 (자체적으로 editorRef와 setRawText를 받아 작동) */}
      <EditorToolbar 
        editorRef={editorRef}
        setRawText={setRawText}
      />

      <textarea 
        ref={editorRef}
        className={styles.editorTextarea} 
        style={{ 
          overflowY: 'hidden', 
          minHeight: '400px', 
          maxHeight: 'none', 
          resize: 'none',
          width: '100%',
          boxSizing: 'border-box',
          flex: 1
        }}
        placeholder="마크다운으로 내용을 자유롭게 작성하세요..."
        value={rawText}
        onChange={e => {
          setRawText(e.target.value);
          adjustTextareaHeight(e.target);
        }}
        onKeyDown={handleLocalKeyDown}
      />
    </div>
  );
};

export default EditorWritePane;
// 파일 위치: src/pages/Editor/components/EditorWritePane.jsx
// 기능 요약: 속성 패널을 모달로 이관하고 마크다운 본문 편집에만 집중할 수 있도록 경량화된 작성 컴포넌트
import React, { useEffect, useCallback } from 'react';
import styles from '../EditorPage.module.css';
import EditorToolbar from './EditorToolbar';

const EditorWritePane = ({
  docType, title, setTitle, rawText, setRawText, editorRef, handleEditorKeyDown
}) => {

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

  const sortSelectedLines = useCallback(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return alert("정렬할 텍스트 라인들을 드래그로 선택해 주세요.");

    const text = textarea.value;
    const selected = text.substring(start, end);
    const lines = selected.split('\n');
    
    lines.sort((a, b) => a.localeCompare(b, 'ko-KR'));
    const sortedText = lines.join('\n');

    setRawText(text.substring(0, start) + sortedText + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + sortedText.length);
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
      // 불필요한 scroll 텔레포트를 걷어내어 부드러운 순정 스크롤 보장
      element.style.setProperty('height', 'auto', 'important');
      const targetHeight = element.scrollHeight + 5;
      element.style.setProperty('height', targetHeight + 'px', 'important');
    }
  }, []);

  useEffect(() => {
    if (editorRef?.current) {
      adjustTextareaHeight(editorRef.current);
    }
  }, [rawText, adjustTextareaHeight, editorRef]);

  return (
    /* ★ Flex 제약을 해제하는 display: 'block' 부여로 아래 방향으로의 화면 무한 팽창 허용 */
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

      <EditorToolbar 
        applyTextFormat={applyTextFormat} 
        sortSelectedLines={sortSelectedLines} 
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
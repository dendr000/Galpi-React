// 파일 위치: src/domains/memo/hooks/useMemoEvents.js
import { useMemoSelection } from './events/useMemoSelection';
import { useMemoTableNav } from './events/useMemoTableNav';

export const useMemoEvents = ({ editorRef, saveMemo, updateCharCount, checkTableFocus, insertFootnote, handleFootnoteClick }) => {
  // 하위 이벤트 모듈 마운트
  const { handleSelectAll, handleCopy } = useMemoSelection({ editorRef, updateCharCount });
  const { handleTableNavigation } = useMemoTableNav({ editorRef, updateCharCount });

  const handleTitleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      saveMemo();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const handleEditorKeyDown = (e) => {
    // 저장 및 각주 단축키
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation(); saveMemo(); return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
      e.preventDefault(); e.stopPropagation(); if (insertFootnote) insertFootnote(); return;
    }

    // Ctrl+A 격리 모드 스캐너 (하위 모듈 위임)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      if (handleSelectAll(e)) return;
    }

    // 엑셀식 스마트 Tab / Enter 표 네비게이션 (하위 모듈 위임)
    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
      if (handleTableNavigation(e)) return;
    }
  };

  const handleEditorClick = (e) => {
    checkTableFocus();
    updateCharCount();

    if (handleFootnoteClick) {
      handleFootnoteClick(e);
    }

    if (e.target.type === 'checkbox' && editorRef.current.contains(e.target)) {
      const isChecked = e.target.checked;
      const nextSpan = e.target.nextElementSibling;
      if (nextSpan) {
        nextSpan.style.textDecoration = isChecked ? 'line-through' : 'none';
        nextSpan.style.color = isChecked ? 'var(--text-secondary)' : 'var(--text-primary)';
      }
      setTimeout(saveMemo, 100); 
    }
  };

  return { handleTitleKeyDown, handleEditorKeyDown, handleCopy, handleEditorClick };
};
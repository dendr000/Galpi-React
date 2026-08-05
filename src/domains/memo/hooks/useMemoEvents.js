import { useMemoSelection } from './events/useMemoSelection';
import { useMemoTableNav } from './events/useMemoTableNav';

// ★ closeLinkPopover 속성 수신
export const useMemoEvents = ({ editorRef, saveMemo, updateCharCount, checkTableFocus, insertFootnote, handleFootnoteClick, triggerLinkEdit, closeLinkPopover, navigate, setActiveMemoId }) => {
  const { handleSelectAll, handleCopy } = useMemoSelection({ editorRef, updateCharCount });
  const { handleTableNavigation } = useMemoTableNav({ editorRef, updateCharCount });

  const insertMarkdownLink = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (triggerLinkEdit) triggerLinkEdit();
  };

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
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation(); saveMemo(); return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
      e.preventDefault(); e.stopPropagation(); if (insertFootnote) insertFootnote(); return;
    }

    if (e.altKey && (e.key === 'w' || e.key === 'W')) {
      e.preventDefault(); e.stopPropagation();
      insertMarkdownLink();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      if (handleSelectAll(e)) return;
    }

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
      if (saveMemo) setTimeout(saveMemo, 100); 
    }

    const linkNode = e.target.closest('.memo-internal-link');
    if (linkNode) {
        e.preventDefault();
        const href = linkNode.getAttribute('href');

        if (href) {
            try {
                const url = new URL(href, window.location.origin);
                const memoId = url.searchParams.get('id');

                if (memoId && setActiveMemoId) {
                    if (saveMemo) saveMemo(); 
                    if (closeLinkPopover) closeLinkPopover(); // ★ DOM 교체 전 툴팁 강제 철거
                    
                    const parsedId = isNaN(Number(memoId)) ? memoId : Number(memoId);
                    setActiveMemoId(parsedId);
                    console.log(`[useMemoEvents] 내부 링크 클릭 캡처 - 메모 ${parsedId}번으로 스위칭`);
                } else if (navigate) {
                    if (closeLinkPopover) closeLinkPopover(); // ★ 라우팅 전 툴팁 강제 철거
                    navigate(href);
                }
            } catch (err) {
                console.error("[useMemoEvents] URL 파싱 오류:", err);
            }
        }
    }
  };

  return { handleTitleKeyDown, handleEditorKeyDown, handleCopy, handleEditorClick, insertMarkdownLink };
};
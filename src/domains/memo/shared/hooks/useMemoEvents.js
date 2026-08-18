// 파일 위치: src/domains/memo/shared/hooks/useMemoEvents.js
import { useMemoSelection } from './events/useMemoSelection';
import { useMemoTableNav } from './events/useMemoTableNav';

export const useMemoEvents = ({ 
  editorRef, saveMemo, updateCharCount, checkTableFocus, 
  insertFootnote, handleFootnoteClick, triggerLinkEdit, 
  closeLinkPopover, insertBookmark, openBookmarkModal, navigate, setActiveMemoId,
  saveAsTemplate, toggleAutoSnippet // ★ 훅에서 주입받은 상용구 함수
}) => {
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
    // 1. 단축키 시스템 (저장, 각주, 북마크, 링크, 취소선, 상용구)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation(); saveMemo(); return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
      e.preventDefault(); e.stopPropagation(); if (insertFootnote) insertFootnote(); return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); e.stopPropagation(); if (insertBookmark) insertBookmark(); return;
    }
    
    // Alt + W, Alt + G 단축키가 Alt + Shift와 충돌하지 않도록 !e.shiftKey 방어 로직 추가
    if (e.altKey && !e.shiftKey && (e.key === 'w' || e.key === 'W')) {
      e.preventDefault(); e.stopPropagation(); insertMarkdownLink(); return;
    }
    if (e.altKey && !e.shiftKey && (e.key === 'g' || e.key === 'G')) {
      e.preventDefault(); e.stopPropagation(); if (openBookmarkModal) openBookmarkModal(); return;
    }

    // ★ 신규 단축키: 취소선 (Ctrl + Shift + Alt + -)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.altKey && e.key === '-') {
      e.preventDefault(); e.stopPropagation();
      document.execCommand('strikeThrough', false, null);
      if (updateCharCount) updateCharCount();
      return;
    }

    // ★ 신규 단축키: 상용구 토글 ON/OFF (Alt + Shift + T)
    // 대소문자 무시를 위해 .toLowerCase() 로 처리
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault(); e.stopPropagation();
      if (toggleAutoSnippet) toggleAutoSnippet();
      return;
    }

    // ★ 신규 단축키: 상용구 모달 띄우기 (Alt + T)
    if (e.altKey && !e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault(); e.stopPropagation();
      if (saveAsTemplate) saveAsTemplate();
      return;
    }

    const selection = window.getSelection();

    // 자동 완성 기호 짝꿍 매핑
    const pairMap = {
      '"': '"',
      "'": "'",
      '*': '*',
      '(': ')',
      '{': '}',
      '[': ']'
    };

    if (pairMap[e.key]) {
      if (selection.rangeCount > 0 && editorRef.current && editorRef.current.contains(selection.anchorNode)) {
        e.preventDefault();
        e.stopPropagation();
        
        const selectedText = selection.toString();
        const openChar = e.key;
        const closeChar = pairMap[e.key]; 
        
        document.execCommand('insertText', false, openChar + selectedText + closeChar);
        
        if (selectedText.length === 0) {
          selection.modify('move', 'backward', 'character');
        }
        
        if (updateCharCount) updateCharCount();
        return;
      }
    }

    if (selection.rangeCount > 0) {
      const anchor = selection.anchorNode;
      const element = anchor.nodeType === 3 ? anchor.parentNode : anchor;

      const foldTitle = element.closest ? element.closest('.fold-title') : null;
      if (foldTitle) {
        if (e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          const details = foldTitle.closest('details');
          if (details) {
            details.open = true;
            const contentBox = details.querySelector('.fold-content');
            if (contentBox) {
              contentBox.focus();
              const range = document.createRange();
              range.selectNodeContents(contentBox);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
          return;
        }

        if (e.key === 'Backspace') {
          const range = selection.getRangeAt(0);
          if (range.collapsed && range.startOffset === 0) {
            if (range.startContainer === foldTitle || range.startContainer === foldTitle.firstChild) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }
        }
      }
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
                    if (closeLinkPopover) closeLinkPopover();
                    
                    const parsedId = isNaN(Number(memoId)) ? memoId : Number(memoId);
                    setActiveMemoId(parsedId);
                    console.log(`[useMemoEvents] 내부 링크 클릭 캡처 - 메모 ${parsedId}번으로 스위칭`);
                } else if (navigate) {
                    if (closeLinkPopover) closeLinkPopover();
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
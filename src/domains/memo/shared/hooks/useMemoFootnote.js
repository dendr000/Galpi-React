// 파일 위치: src/domains/memo/shared/hooks/useMemoFootnote.js
import { useState, useEffect, useRef } from 'react';

export const useMemoFootnote = (editorRef, updateCharCount, saveMemo) => {
  const [popover, setPopover] = useState({ isOpen: false, x: 0, y: 0, mode: 'view', content: '', targetNode: null });
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('memo-footnote-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-footnote-styles';
      style.innerHTML = `
        #memo-edit-content { counter-reset: memo-footnote-counter; }
        .memo-footnote { 
            counter-increment: memo-footnote-counter; 
            color: var(--primary-color); 
            font-weight: 900; 
            background: var(--table-bg-alt); 
            padding: 0 2px; 
            margin: 0; 
            border-radius: 3px; 
            cursor: pointer; 
            font-size: 0.85em; 
            vertical-align: super; 
            text-decoration: none; 
            user-select: none; 
            display: inline; /* ★ 블록 끊김 현상을 막기 위해 순수 인라인 요소로 유지 */
        }
        .memo-footnote::before { content: "[" counter(memo-footnote-counter) "]"; }
        .memo-footnote:hover { background: rgba(59,91,219,0.2); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const openPopover = (node, mode = 'view') => {
    const rect = node.getBoundingClientRect();
    setPopover({
      isOpen: true,
      x: rect.left,
      y: rect.bottom + 6,
      mode,
      content: node.getAttribute('data-note') || '',
      targetNode: node
    });
  };

  const closePopover = () => {
    setPopover(prev => ({ ...prev, isOpen: false, mode: 'view' }));
  };

  const switchToEdit = () => {
    setPopover(prev => ({ ...prev, mode: 'edit' }));
  };

  const insertFootnote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const fnId = `fn_${Date.now()}`;
    
    // ★ 픽스: 부작용을 일으키던 가짜 투명 발판(&#8203;)을 완전히 제거하고 순수 태그만 삽입합니다.
    const html = `<sup class="memo-footnote" contenteditable="false" data-id="${fnId}" data-note=""></sup>`;
    
    document.execCommand('insertHTML', false, html);
    if (updateCharCount) updateCharCount();
    
    setTimeout(() => {
      const node = editorRef.current.querySelector(`.memo-footnote[data-id="${fnId}"]`);
      if (node) openPopover(node, 'edit');
    }, 50);
  };

  const updateFootnote = (newContent) => {
    if (popover.targetNode) {
      popover.targetNode.setAttribute('data-note', newContent);
      setPopover(prev => ({ ...prev, content: newContent, mode: 'view' }));
      if (saveMemo) setTimeout(saveMemo, 100);
    }
  };

  const deleteFootnote = () => {
    if (popover.targetNode) {
      popover.targetNode.remove();
      closePopover();
      if (updateCharCount) updateCharCount();
      if (saveMemo) setTimeout(saveMemo, 100);
    }
  };

  useEffect(() => {
    const handleOver = (e) => {
      const target = e.target.closest('.memo-footnote');
      if (target) {
        clearTimeout(timeoutRef.current);
        setPopover(prev => {
          if (prev.mode === 'edit') return prev;
          const rect = target.getBoundingClientRect();
          return {
            isOpen: true,
            x: rect.left,
            y: rect.bottom + 6,
            mode: 'view',
            content: target.getAttribute('data-note') || '',
            targetNode: target
          };
        });
      }
    };

    const handleOut = (e) => {
      const target = e.target.closest('.memo-footnote');
      if (target) {
        timeoutRef.current = setTimeout(() => {
          setPopover(p => p.mode === 'view' ? { ...p, isOpen: false } : p);
        }, 250);
      }
    };

    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    return () => {
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
    };
  }, []);

  const handleFootnoteClick = (e) => {
    const node = e.target.closest('.memo-footnote');
    if (node) {
      e.preventDefault();
      e.stopPropagation();
      openPopover(node, 'edit');
    }
  };

  return { popover, insertFootnote, closePopover, switchToEdit, updateFootnote, deleteFootnote, timeoutRef, handleFootnoteClick };
};
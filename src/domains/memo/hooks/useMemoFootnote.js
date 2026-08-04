// 파일 위치: src/domains/memo/hooks/useMemoFootnote.js
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
        .memo-footnote { counter-increment: memo-footnote-counter; color: var(--primary-color); font-weight: 900; background: var(--table-bg-alt); padding: 0 2px; margin: 0; border-radius: 3px; cursor: pointer; font-size: 0.85em; vertical-align: super; text-decoration: none; user-select: none; }
        .memo-footnote::before { content: "[" counter(memo-footnote-counter) "]"; }
        .memo-footnote:hover { background: rgba(59,91,219,0.2); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const openPopover = (node, mode = 'view') => {
    const rect = node.getBoundingClientRect();
    
    // ★ fixed 포지셔닝에 맞춰 뷰포트 절대 좌표를 그대로 주입합니다.
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
    // 창이 닫힐 때 시스템 내부 상태도 무조건 'view'(보기) 모드로 초기화하여 호버 센서 먹통 현상 원천 차단
    setPopover(prev => ({ ...prev, isOpen: false, mode: 'view' }));
  };

  const switchToEdit = () => {
    setPopover(prev => ({ ...prev, mode: 'edit' }));
  };

  const insertFootnote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const fnId = `fn_${Date.now()}`;
    const html = `<sup class="memo-footnote" data-id="${fnId}" data-note="" contenteditable="false"></sup>`;
    document.execCommand('insertHTML', false, html);
    updateCharCount();

    setTimeout(() => {
      const node = editorRef.current.querySelector(`.memo-footnote[data-id="${fnId}"]`);
      if (node) openPopover(node, 'edit');
    }, 50);
  };

  const updateFootnote = (newContent) => {
    if (popover.targetNode) {
      popover.targetNode.setAttribute('data-note', newContent);
      // 저장 후 뷰 모드(까만 툴팁)로 스위칭
      setPopover(prev => ({ ...prev, content: newContent, mode: 'view' }));
      setTimeout(saveMemo, 100);
    }
  };

  const deleteFootnote = () => {
    if (popover.targetNode) {
      popover.targetNode.remove();
      closePopover();
      updateCharCount();
      setTimeout(saveMemo, 100);
    }
  };

  const handleMouseOver = (e) => {
    clearTimeout(timeoutRef.current);
    if (popover.mode === 'edit') return; 
    const node = e.target.closest('.memo-footnote');
    if (node) openPopover(node, 'view');
  };

  const handleMouseOut = (e) => {
    if (popover.mode === 'edit') return;
    timeoutRef.current = setTimeout(() => {
      setPopover(p => p.mode === 'view' ? { ...p, isOpen: false } : p);
    }, 250); 
  };

  const handleFootnoteClick = (e) => {
    const node = e.target.closest('.memo-footnote');
    if (node) {
      e.preventDefault();
      e.stopPropagation();
      openPopover(node, 'edit');
    }
  };

  return { 
    popover, insertFootnote, closePopover, switchToEdit, 
    updateFootnote, deleteFootnote, timeoutRef, 
    handleMouseOver, handleMouseOut, handleFootnoteClick 
  };
};
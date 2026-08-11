// 파일 위치: src/domains/memo/shared/hooks/useMemoFootnote.js
import { useState, useEffect, useRef } from 'react';

export const useMemoFootnote = (editorRef, updateCharCount, saveMemo) => {
  const [popover, setPopover] = useState({ isOpen: false, x: 0, y: 0, mode: 'view', content: '', targetNode: null });
  const timeoutRef = useRef(null);

  // ★ CSS 정밀 교정: 글자에 착 달라붙도록 margin과 padding 최소화
  useEffect(() => {
    if (!document.getElementById('memo-footnote-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-footnote-styles';
      style.innerHTML = `
        .memo-footnote { 
            color: var(--primary-color); 
            font-weight: 900; 
            background: var(--table-bg-alt); 
            padding: 0 2px; 
            margin: 0 1px; 
            border-radius: 3px; 
            cursor: pointer; 
            font-size: 0.8em; 
            vertical-align: super; 
            text-decoration: none; 
            user-select: none; 
            display: inline;
        }
        .memo-footnote:hover { background: rgba(59,91,219,0.2); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ★ 번호 재정렬 전담 옵저버
  useEffect(() => {
    if (!editorRef.current) return;
    
    const updateFootnoteNumbers = () => {
      const markers = editorRef.current.querySelectorAll('.memo-footnote');
      markers.forEach((m, idx) => {
        const exactText = `[${idx + 1}]`;
        if (m.textContent !== exactText) {
           m.textContent = exactText;
        }
      });
    };

    const observer = new MutationObserver(() => {
      updateFootnoteNumbers();
    });
    
    observer.observe(editorRef.current, { childList: true, subtree: true, characterData: true });
    updateFootnoteNumbers(); 
    
    return () => observer.disconnect();
  }, [editorRef]);

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
    // 삽입 시점의 총 각주 개수를 파악하여 [*] 대신 즉각 번호를 부여
    const currentCount = editorRef.current.querySelectorAll('.memo-footnote').length + 1;
    
    // ★ 핵심 픽스: 각주 뒤에 보이지 않는 공백(&#8203;)을 추가하여 캐럿 함정(클릭 안 됨)과 백스페이스 통째로 날아감 방지
    const html = `<sup class="memo-footnote" contenteditable="false" data-id="${fnId}" data-note="">[${currentCount}]</sup>&#8203;`;
    
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
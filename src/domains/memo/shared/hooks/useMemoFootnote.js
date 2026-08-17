// 파일 위치: src/domains/memo/shared/hooks/useMemoFootnote.js
import { useState, useEffect, useRef } from 'react';

export const useMemoFootnote = (editorRef, updateCharCount, saveMemo) => {
  const [popover, setPopover] = useState({ isOpen: false, x: 0, y: 0, mode: 'view', content: '', targetNode: null });
  const timeoutRef = useRef(null);

  // ★ CSS 정밀 교정: inline을 유지하여 튕김 차단
  useEffect(() => {
    if (!document.getElementById('memo-footnote-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-footnote-styles';
      style.innerHTML = `
        .memo-footnote { 
            color: var(--primary-color); 
            font-weight: 900; 
            background: var(--table-bg-alt); 
            padding: 0 1px; 
            margin: 0; 
            border-radius: 3px; 
            cursor: pointer; 
            font-size: 0.8em; 
            vertical-align: super; 
            text-decoration: none; 
            user-select: none; 
            display: inline;
            white-space: nowrap;
            line-height: 1;
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
    const rawContent = node.getAttribute('data-note') || '';
    
    // 에디터 로드 시 속성 내부에 잘못 치환된 <br> 텍스트를 다시 정상 줄바꿈(\n)으로 복구
    const cleanContent = rawContent.replace(/<br\s*\/?>/gi, '\n');

    setPopover({
      isOpen: true,
      x: rect.left,
      y: rect.bottom + 6,
      mode,
      content: cleanContent,
      targetNode: node
    });
  };

  const closePopover = () => {
    setPopover(prev => ({ ...prev, isOpen: false, mode: 'view' }));
  };

  const switchToEdit = () => {
    setPopover(prev => ({ ...prev, mode: 'edit' }));
  };

  // ★ 핵심 변경 구역: 브라우저 기본 삽입(execCommand)을 폐기하고, Range API를 통한 물리적 DOM 강제 삽입 적용
  const insertFootnote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const fnId = `fn_${Date.now()}`;
    const currentCount = editorRef.current.querySelectorAll('.memo-footnote').length + 1;

    // 1. 단어 결합자 (Word Joiner, U+2060): 브라우저에게 "절대 여기서 줄을 바꾸지 마라"고 명령하는 특수 본드
    const wj1 = document.createTextNode('\u2060');
    const wj2 = document.createTextNode('\u2060');

    // 2. 각주 태그 순수 DOM 생성
    const sup = document.createElement('sup');
    sup.className = 'memo-footnote';
    sup.contentEditable = 'false';
    sup.setAttribute('data-id', fnId);
    sup.setAttribute('data-note', '');
    sup.textContent = `[${currentCount}]`;

    // 3. 조각상(Fragment)에 본드와 각주를 하나로 묶음
    const fragment = document.createDocumentFragment();
    fragment.appendChild(wj1);
    fragment.appendChild(sup);
    fragment.appendChild(wj2);

    // 4. 현재 커서 위치를 정확히 가져와서 드래그된 내용이 있으면 지우고, 그 자리에 조각상을 꽂아 넣음
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(fragment);

    // 5. 커서를 각주 뒤의 본드(wj2) 바로 뒤로 이동시켜 줌
    range.setStartAfter(wj2);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    if (updateCharCount) updateCharCount();
    if (saveMemo) setTimeout(saveMemo, 100); // 돔 구조 변경 시 수동 강제 저장 유도

    // 생성 직후 편집 팝오버 띄우기
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
          const rawContent = target.getAttribute('data-note') || '';
          
          const cleanContent = rawContent.replace(/<br\s*\/?>/gi, '\n');

          return {
            isOpen: true,
            x: rect.left,
            y: rect.bottom + 6,
            mode: 'view',
            content: cleanContent,
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
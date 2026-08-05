// 파일 위치: src/domains/memo/hooks/useMemoBlockDrag.js
import { useEffect, useRef } from 'react';

export const useMemoBlockDrag = ({ editorRef, updateCharCount, saveMemo }) => {
  const draggedBlockRef = useRef(null);
  const hoveredBlockRef = useRef(null);
  const indicatorTargetRef = useRef(null);
  const indicatorPosRef = useRef(null);
  const callbacksRef = useRef({ updateCharCount, saveMemo });

  useEffect(() => {
    callbacksRef.current = { updateCharCount, saveMemo };
  }, [updateCharCount, saveMemo]);

  useEffect(() => {
    if (!document.getElementById('memo-block-drag-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-block-drag-styles';
      style.innerHTML = `
        .memo-block-drag-handle {
          position: fixed; width: 20px; height: 24px; border-radius: 4px;
          display: none; align-items: center; justify-content: center;
          cursor: grab; z-index: 9999999; color: var(--text-secondary);
          background: transparent; transition: background 0.2s, color 0.2s;
          user-select: none;
        }
        .memo-block-drag-handle:hover {
          background: var(--table-bg-alt); color: var(--primary-color);
        }
        .memo-block-drag-handle:active { cursor: grabbing; }
        .memo-drop-indicator {
          position: fixed; height: 3px; background: var(--primary-color);
          border-radius: 2px; display: none; z-index: 9999999; pointer-events: none;
          box-shadow: 0 0 6px rgba(59,91,219,0.5);
        }
      `;
      document.head.appendChild(style);
    }

    let handle = document.getElementById('memo-block-drag-handle');
    if (!handle) {
      handle = document.createElement('div');
      handle.id = 'memo-block-drag-handle';
      handle.className = 'memo-block-drag-handle';
      handle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>';
      handle.draggable = true;
      document.body.appendChild(handle);
    }

    let indicator = document.getElementById('memo-drop-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'memo-drop-indicator';
      indicator.className = 'memo-drop-indicator';
      document.body.appendChild(indicator);
    }

    const onMouseMove = (e) => {
      if (draggedBlockRef.current) return;

      const editor = editorRef?.current || document.getElementById('memo-edit-content');
      if (!editor) return;

      let foundBlock = null;
      
      // 마우스가 표 바깥의 왼쪽 여백에 있더라도 Y축 레이캐스팅을 통해 표를 감지합니다.
      const blocks = editor.querySelectorAll('table, details');
      for (let i = 0; i < blocks.length; i++) {
        const rect = blocks[i].getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          // 블록의 좌측 60px 이내 여백이거나 블록 내부일 경우 표적 획득
          if (e.clientX >= rect.left - 60 && e.clientX <= rect.right) {
            foundBlock = blocks[i];
            break;
          }
        }
      }

      if (foundBlock) {
        hoveredBlockRef.current = foundBlock;
        const rect = foundBlock.getBoundingClientRect();

        handle.style.display = 'flex';
        handle.style.top = `${rect.top}px`;
        handle.style.left = `${rect.left - 24}px`;
      } else {
        if (handle.style.display === 'flex') {
          const hRect = handle.getBoundingClientRect();
          const inHandle = e.clientX >= hRect.left - 15 && e.clientX <= hRect.right + 15 &&
                           e.clientY >= hRect.top - 15 && e.clientY <= hRect.bottom + 15;
          if (!inHandle) {
            handle.style.display = 'none';
            hoveredBlockRef.current = null;
          }
        }
      }
    };

    const onScroll = () => {
      if (handle.style.display === 'flex') {
        handle.style.display = 'none';
        indicator.style.display = 'none';
      }
    };

    const onDragStart = (e) => {
      if (!hoveredBlockRef.current) {
        e.preventDefault();
        return;
      }
      
      document.activeElement?.blur();
      draggedBlockRef.current = hoveredBlockRef.current;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'memo-block');

      try {
        e.dataTransfer.setDragImage(draggedBlockRef.current, 0, 0);
      } catch(err) {}

      setTimeout(() => {
        if (draggedBlockRef.current) draggedBlockRef.current.style.opacity = '0.4';
      }, 0);
    };

    const onDragEnd = () => {
      if (draggedBlockRef.current) {
         draggedBlockRef.current.style.opacity = '1';
         draggedBlockRef.current = null;
      }
      handle.style.display = 'none';
      indicator.style.display = 'none';
      indicatorTargetRef.current = null;
    };

    const onDragEnter = (e) => {
      if (!draggedBlockRef.current) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onDragOver = (e) => {
      if (!draggedBlockRef.current) return;
      e.preventDefault();
      e.stopPropagation(); 
      e.dataTransfer.dropEffect = 'move';

      const editor = editorRef?.current || document.getElementById('memo-edit-content');
      if (!editor) return;

      const targetBlock = e.target.closest('table, details, p, h1, h2, h3, h4, div');

      if (targetBlock && editor.contains(targetBlock) && targetBlock !== draggedBlockRef.current && targetBlock.id !== 'memo-edit-content') {
        const rect = targetBlock.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        indicator.style.display = 'block';
        indicator.style.left = `${rect.left}px`;
        indicator.style.width = `${rect.width}px`;

        if (e.clientY < midY) {
          indicator.style.top = `${rect.top - 2}px`;
          indicatorPosRef.current = 'before';
        } else {
          indicator.style.top = `${rect.bottom + 2}px`;
          indicatorPosRef.current = 'after';
        }
        indicatorTargetRef.current = targetBlock;
      }
    };

    const onDrop = (e) => {
      if (!draggedBlockRef.current) return;
      e.preventDefault();
      e.stopPropagation(); 

      const target = indicatorTargetRef.current;
      const pos = indicatorPosRef.current;
      const dragged = draggedBlockRef.current;

      if (target && dragged) {
         if (pos === 'before') {
             target.parentNode.insertBefore(dragged, target);
         } else if (pos === 'after') {
             target.parentNode.insertBefore(dragged, target.nextSibling);
         }
         if (callbacksRef.current.updateCharCount) callbacksRef.current.updateCharCount();
         if (callbacksRef.current.saveMemo) setTimeout(callbacksRef.current.saveMemo, 100);
      }
      onDragEnd();
    };

    document.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('scroll', onScroll, true); 
    document.addEventListener('dragenter', onDragEnter, true); 
    document.addEventListener('dragover', onDragOver, true);
    document.addEventListener('drop', onDrop, true);
    
    handle.addEventListener('dragstart', onDragStart);
    handle.addEventListener('dragend', onDragEnd);

    return () => {
      document.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('dragenter', onDragEnter, true);
      document.removeEventListener('dragover', onDragOver, true);
      document.removeEventListener('drop', onDrop, true);
      handle.removeEventListener('dragstart', onDragStart);
      handle.removeEventListener('dragend', onDragEnd);
    };
  }, [editorRef]);

  return {};
};
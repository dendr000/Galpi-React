// 파일 위치: src/domains/memo/hooks/drag/useBlockDragDrop.js
// 기능 요약: 드래그 핸들을 이용한 HTML5 네이티브 드래그 앤 드롭 이벤트(DragStart, DragOver, Drop 등)를 제어하고, 블록 재배치 연산을 수행하는 훅

import { useEffect, useRef } from 'react';
import { initDragDOM } from './dragDOMBuilder';

export const useBlockDragDrop = ({ editorRef, callbacksRef, draggedBlockRef, hoveredBlockRef }) => {
  const indicatorTargetRef = useRef(null);
  const indicatorPosRef = useRef(null);

  useEffect(() => {
    const { handle, indicator } = initDragDOM();
    if (!handle || !indicator) return;

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

    document.addEventListener('dragenter', onDragEnter, true);
    document.addEventListener('dragover', onDragOver, true);
    document.addEventListener('drop', onDrop, true);
    
    handle.addEventListener('dragstart', onDragStart);
    handle.addEventListener('dragend', onDragEnd);

    return () => {
      document.removeEventListener('dragenter', onDragEnter, true);
      document.removeEventListener('dragover', onDragOver, true);
      document.removeEventListener('drop', onDrop, true);
      handle.removeEventListener('dragstart', onDragStart);
      handle.removeEventListener('dragend', onDragEnd);
    };
  }, [editorRef, callbacksRef, draggedBlockRef, hoveredBlockRef]);
};
// 파일 위치: src/components/layout/fab/memo/hooks/useMemoBlockDrag.js
// 기능 요약: 노션(Notion) 스타일의 블록 드래그 핸들 [⋮⋮] 표출 및 HTML5 Native DnD 블록 재배치 물리 엔진
// 버전: v1.1.0 (순수 표 및 아코디언 직접 타겟팅 버그 픽스)
import { useEffect, useRef } from 'react';

export const useMemoBlockDrag = ({ editorRef, updateCharCount, saveMemo }) => {
  const draggedBlockRef = useRef(null);
  const hoveredBlockRef = useRef(null);
  const indicatorTargetRef = useRef(null);
  const indicatorPosRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('memo-block-drag-styles')) {
      const style = document.createElement('style');
      style.id = 'memo-block-drag-styles';
      style.innerHTML = `
        .memo-block-drag-handle {
          position: absolute; width: 18px; height: 24px; border-radius: 4px;
          display: none; align-items: center; justify-content: center;
          cursor: grab; z-index: 99999; color: var(--text-secondary);
          font-size: 14px; font-weight: bold; letter-spacing: -2px; line-height: 1;
          background: transparent; transition: background 0.2s, color 0.2s;
          user-select: none; padding-bottom: 4px;
        }
        .memo-block-drag-handle:hover {
          background: var(--table-bg-alt); color: var(--primary-color);
        }
        .memo-block-drag-handle:active { cursor: grabbing; }
        .memo-drop-indicator {
          position: absolute; height: 3px; background: var(--primary-color);
          border-radius: 2px; display: none; z-index: 99999; pointer-events: none;
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
      handle.innerHTML = '⋮⋮';
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

    const editor = editorRef.current;
    if (!editor) return;

    const onMouseMove = (e) => {
      if (draggedBlockRef.current) return;

      // ★ 픽스: 껍데기가 사라진 table과 details 태그를 직접 타겟팅하도록 셀렉터 교체
      const block = e.target.closest('table, details');
      
      if (block && editor.contains(block) && block !== editor) {
        hoveredBlockRef.current = block;
        const rect = block.getBoundingClientRect();
        const editorRect = editor.getBoundingClientRect();
        
        handle.style.display = 'flex';
        handle.style.top = `${rect.top + window.scrollY}px`;
        handle.style.left = `${editorRect.left + window.scrollX + 2}px`;
      } else {
        const hRect = handle.getBoundingClientRect();
        const inHandle = e.clientX >= hRect.left - 5 && e.clientX <= hRect.right + 5 &&
                         e.clientY >= hRect.top - 5 && e.clientY <= hRect.bottom + 5;
        if (!inHandle) {
          handle.style.display = 'none';
          hoveredBlockRef.current = null;
        }
      }
    };

    const onScroll = () => {
      handle.style.display = 'none';
      indicator.style.display = 'none';
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

    const onDragOver = (e) => {
      if (!draggedBlockRef.current) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      // ★ 픽스: 타겟 블록 감지에도 table과 details 태그 직접 지정
      const targetBlock = e.target.closest('table, details, p, h1, h2, h3, h4');

      if (targetBlock && editor.contains(targetBlock) && targetBlock !== draggedBlockRef.current) {
        const rect = targetBlock.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        indicator.style.display = 'block';
        indicator.style.left = `${rect.left + window.scrollX}px`;
        indicator.style.width = `${rect.width}px`;

        if (e.clientY < midY) {
          indicator.style.top = `${rect.top + window.scrollY - 2}px`;
          indicatorPosRef.current = 'before';
        } else {
          indicator.style.top = `${rect.bottom + window.scrollY + 2}px`;
          indicatorPosRef.current = 'after';
        }
        indicatorTargetRef.current = targetBlock;
      }
    };

    const onDrop = (e) => {
      if (!draggedBlockRef.current) return;
      e.preventDefault();

      const target = indicatorTargetRef.current;
      const pos = indicatorPosRef.current;
      const dragged = draggedBlockRef.current;

      if (target && dragged) {
         if (pos === 'before') {
             target.parentNode.insertBefore(dragged, target);
         } else if (pos === 'after') {
             target.parentNode.insertBefore(dragged, target.nextSibling);
         }
         updateCharCount();
         setTimeout(saveMemo, 100);
      }
      onDragEnd();
    };

    editor.addEventListener('mousemove', onMouseMove);
    editor.addEventListener('scroll', onScroll);
    editor.addEventListener('dragover', onDragOver);
    editor.addEventListener('drop', onDrop);
    handle.addEventListener('dragstart', onDragStart);
    handle.addEventListener('dragend', onDragEnd);

    return () => {
      editor.removeEventListener('mousemove', onMouseMove);
      editor.removeEventListener('scroll', onScroll);
      editor.removeEventListener('dragover', onDragOver);
      editor.removeEventListener('drop', onDrop);
      handle.removeEventListener('dragstart', onDragStart);
      handle.removeEventListener('dragend', onDragEnd);
    };

  }, [editorRef, saveMemo, updateCharCount]);

  return {};
};
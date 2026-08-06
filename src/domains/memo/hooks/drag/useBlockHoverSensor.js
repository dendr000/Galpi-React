// 파일 위치: src/domains/memo/hooks/drag/useBlockHoverSensor.js
// 기능 요약: 마우스 이동 및 스크롤을 감지하여 표나 아코디언 블록 좌측에 드래그 핸들을 적절한 위치에 띄우는 호버 센서 훅

import { useEffect } from 'react';
import { initDragDOM } from './dragDOMBuilder';

export const useBlockHoverSensor = ({ editorRef, draggedBlockRef, hoveredBlockRef }) => {
  useEffect(() => {
    const { handle, indicator } = initDragDOM();
    if (!handle || !indicator) return;

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

    document.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      document.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [editorRef, draggedBlockRef, hoveredBlockRef]);
};
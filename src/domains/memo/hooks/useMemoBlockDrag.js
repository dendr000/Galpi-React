// 파일 위치: src/domains/memo/hooks/useMemoBlockDrag.js
// 기능 요약: 텍스트 에디터 내부의 블록 드래그 물리 엔진 하위 모듈들을 통합 조립하여 에디터에 주입하는 중앙 허브(Hub) 훅

import { useEffect, useRef } from 'react';
import { useBlockHoverSensor } from './drag/useBlockHoverSensor';
import { useBlockDragDrop } from './drag/useBlockDragDrop';

export const useMemoBlockDrag = ({ editorRef, updateCharCount, saveMemo }) => {
  const draggedBlockRef = useRef(null);
  const hoveredBlockRef = useRef(null);
  const callbacksRef = useRef({ updateCharCount, saveMemo });

  useEffect(() => {
    callbacksRef.current = { updateCharCount, saveMemo };
  }, [updateCharCount, saveMemo]);

  // 하위 모듈 조립 (호버 센서 및 드래그 앤 드롭 연산 엔진 마운트)
  useBlockHoverSensor({ editorRef, draggedBlockRef, hoveredBlockRef });
  useBlockDragDrop({ editorRef, callbacksRef, draggedBlockRef, hoveredBlockRef });

  return {};
};
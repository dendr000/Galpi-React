// 파일 위치: src/domains/fab_tools/hooks/useBoilerplateCore.js
// 기능 요약: 상용구 삽입 시 Undo 보존, 픽셀 단위 좌표 추적, 커서 텔레포트를 제어하는 물리 엔진
// 버전: v1.0.0

import { useState, useCallback, useRef } from 'react';

export const useBoilerplateCore = (showToast) => {
  // UI 렌더링을 위한 팝업 상태 관리
  const [bpPopupState, setBpPopupState] = useState({
    active: false,
    mode: 'suggest', // 'suggest' | 'choice'
    matches: [],
    selectedIdx: 0,
    keywordLength: 0,
    x: 0,
    y: 0
  });

  // DOM 엘리먼트와 최신 상태를 이벤트 리스너에서 직접 참조하기 위한 Ref
  const targetEditorRef = useRef(null);
  const popupStateRef = useRef(bpPopupState);

  // 상태와 Ref를 동시에 동기화하는 업데이트 래퍼 함수
  const updatePopupState = useCallback((newState) => {
    setBpPopupState(prev => {
      const updated = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      popupStateRef.current = updated;
      return updated;
    });
  }, []);

  // 1. 에디터 내 커서 좌표(X,Y) 추출 (팝업창 위치를 잡기 위한 픽셀 단위 정밀 연산)
  const getCaretCoordinates = useCallback((element, position) => {
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);
    
    for (const prop of style) {
      div.style[prop] = style[prop];
    }
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';

    div.textContent = element.value.substring(0, position);
    
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    document.body.appendChild(div);

    const coords = {
      x: span.offsetLeft,
      y: span.offsetTop,
      h: parseInt(style.fontSize) || 14
    };
    
    document.body.removeChild(div);
    return coords;
  }, []);

  const closeBpPopup = useCallback(() => {
    updatePopupState({ active: false });
    targetEditorRef.current = null;
  }, [updatePopupState]);

  // 2 & 3. Undo 보존 삽입 및 스마트 커서 텔레포트 엔진
  const commitBpExpansion = useCallback((overrideIdx = null) => {
    const state = popupStateRef.current;
    const editor = targetEditorRef.current;

    if (!state.active || !editor) return;

    const idx = overrideIdx !== null ? overrideIdx : state.selectedIdx;
    const bp = state.matches[idx];
    if (!bp) return;

    const pos = editor.selectionStart;
    const kwLen = state.keywordLength;

    // 1단계: 단축어 지울 부분을 브라우저 Selection으로 블록 지정
    editor.setSelectionRange(pos - kwLen, pos);

    const content = bp.content;
    const cursorOffset = content.indexOf('{#}');
    const cleanContent = content.replace('{#}', '');

    // 2단계: 브라우저 내장 execCommand로 삽입하여 Ctrl+Z(실행 취소) 히스토리 완벽 보존
    editor.focus();
    document.execCommand('insertText', false, cleanContent);

    // 3단계: 치환 본문에 {#} 마커가 있었다면 해당 위치로 커서 정밀 텔레포트
    if (cursorOffset !== -1) {
      const targetPos = (pos - kwLen) + cursorOffset;
      editor.setSelectionRange(targetPos, targetPos);
    }

    // React 상태 시스템(onChange/onInput) 동기화를 위한 수동 이벤트 트리거
    editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

    if (showToast) showToast("상용구 변환 완료");

    closeBpPopup();
  }, [closeBpPopup, showToast]);

  return {
    bpPopupState,
    updatePopupState,
    targetEditorRef,
    popupStateRef,
    getCaretCoordinates,
    closeBpPopup,
    commitBpExpansion
  };
};
// 파일 위치: src/domains/fab_tools/hooks/useBoilerplateCore.js
// 기능 요약: 상용구 삽입 시 Undo 보존, 픽셀 단위 좌표 추적, 커서 텔레포트를 제어하는 물리 엔진 (Textarea & ContentEditable 하이브리드 지원)
// 버전: v2.0.0

import { useState, useCallback, useRef } from 'react';

export const useBoilerplateCore = (showToast) => {
  const [bpPopupState, setBpPopupState] = useState({
    active: false,
    mode: 'suggest',
    matches: [],
    selectedIdx: 0,
    keywordLength: 0,
    x: 0,
    y: 0
  });

  const targetEditorRef = useRef(null);
  const popupStateRef = useRef(bpPopupState);

  const updatePopupState = useCallback((newState) => {
    setBpPopupState(prev => {
      const updated = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      popupStateRef.current = updated;
      return updated;
    });
  }, []);

  // ★ 1. 에디터 내 커서 좌표 추출 (ContentEditable의 Range API 완벽 호환)
  const getCaretCoordinates = useCallback((element, position) => {
    if (element.isContentEditable) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return { x: 0, y: 0, h: 14 };
      const range = sel.getRangeAt(0);
      let rect = range.getBoundingClientRect();
      
      // 빈 줄에서 커서 좌표를 따기 위한 Zero-width space 임시 삽입 트릭
      if (rect.width === 0 && rect.height === 0) {
        const span = document.createElement('span');
        span.appendChild(document.createTextNode('\u200b'));
        range.insertNode(span);
        rect = span.getBoundingClientRect();
        span.parentNode.removeChild(span);
      }
      return { x: rect.left, y: rect.bottom, h: rect.height || 14 };
    }

    // 기존 Textarea 처리 로직
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);
    for (const prop of style) { div.style[prop] = style[prop]; }
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.textContent = element.value.substring(0, position);
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    document.body.appendChild(div);
    const coords = { x: span.offsetLeft, y: span.offsetTop, h: parseInt(style.fontSize) || 14 };
    document.body.removeChild(div);
    return coords;
  }, []);

  const closeBpPopup = useCallback(() => {
    updatePopupState({ active: false });
    targetEditorRef.current = null;
  }, [updatePopupState]);

  // ★ 2 & 3. Undo 보존 삽입 및 스마트 커서 텔레포트 엔진
  const commitBpExpansion = useCallback((overrideIdx = null) => {
    const state = popupStateRef.current;
    const editor = targetEditorRef.current;

    if (!state.active || !editor) return;

    const idx = overrideIdx !== null ? overrideIdx : state.selectedIdx;
    const bp = state.matches[idx];
    if (!bp) return;

    const kwLen = state.keywordLength;
    const content = bp.content;
    const cursorOffset = content.indexOf('{#}');
    const cleanContent = content.replace('{#}', '');

    editor.focus();

    if (editor.isContentEditable) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);

      // 단축어 길이를 기반으로 텍스트 노드 내에서 블록 역방향 선택
      if (range.startContainer.nodeType === 3) {
        const startOffset = Math.max(0, range.startOffset - kwLen);
        range.setStart(range.startContainer, startOffset);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      document.execCommand('insertText', false, cleanContent);

      if (cursorOffset !== -1) {
        const moveBack = cleanContent.length - cursorOffset;
        for (let i = 0; i < moveBack; i++) {
          sel.modify('move', 'backward', 'character');
        }
      }
    } else {
      const pos = editor.selectionStart;
      editor.setSelectionRange(pos - kwLen, pos);
      document.execCommand('insertText', false, cleanContent);

      if (cursorOffset !== -1) {
        const targetPos = (pos - kwLen) + cursorOffset;
        editor.setSelectionRange(targetPos, targetPos);
      }
    }

    editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    if (showToast) showToast("상용구 변환 완료");
    closeBpPopup();
  }, [closeBpPopup, showToast]);

  return { bpPopupState, updatePopupState, targetEditorRef, popupStateRef, getCaretCoordinates, closeBpPopup, commitBpExpansion };
};
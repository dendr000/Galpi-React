// 파일 위치: src/domains/fabTools/hooks/useBoilerplateCore.js
// 기능 요약: 상용구 삽입 시 Undo 보존, 픽셀 단위 좌표 추적, 커서 텔레포트, HTML 렌더링을 제어하는 물리 엔진
// 버전: v2.5.0 (HTML 파싱 분기 및 각주 ID 실시간 리프레시 로직 추가)

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

  const getCaretCoordinates = useCallback((element, position) => {
    if (element.isContentEditable) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return { x: 0, y: 0, h: 14 };
      const range = sel.getRangeAt(0);
      let rect = range.getBoundingClientRect();
      
      if (rect.width === 0 && rect.height === 0) {
        const span = document.createElement('span');
        span.appendChild(document.createTextNode('\u200b'));
        range.insertNode(span);
        rect = span.getBoundingClientRect();
        span.parentNode.removeChild(span);
      }
      return { x: rect.left, y: rect.bottom, h: rect.height || 14 };
    }

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

  // ★ 툴바 버튼을 통해 수동으로 템플릿 목록 팝업을 강제 호출하는 기능
  const openTemplateList = useCallback((bpList, editor) => {
    if (!editor || !bpList || bpList.length === 0) {
      if (showToast) showToast("등록된 템플릿/상용구가 없습니다.");
      return;
    }
    targetEditorRef.current = editor;

    let topPos = 0;
    let leftPos = 0;

    if (editor.isContentEditable) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          topPos = rect.bottom + 8;
          leftPos = rect.left;
        }
      }
    }

    // 커서 좌표를 찾지 못한 경우 에디터 좌상단 오프셋으로 지정
    if (topPos === 0 && leftPos === 0) {
      const edRect = editor.getBoundingClientRect();
      topPos = edRect.top + 40;
      leftPos = edRect.left + 40;
    }

    if (topPos + 200 > window.innerHeight) topPos = window.innerHeight - 210;
    if (leftPos + 250 > window.innerWidth) leftPos = window.innerWidth - 260;

    updatePopupState({
      active: true,
      mode: 'choice', // 1~9 숫자 키 선택 가능 모드
      matches: bpList, // 필터링 없이 전체 상용구/템플릿 리스트 표시
      selectedIdx: 0,
      keywordLength: 0, // 수동 삽입이므로 역으로 지울 텍스트 없음
      x: leftPos,
      y: topPos
    });
  }, [updatePopupState, showToast]);

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
    let cleanContent = content.replace('{#}', '');

    // ★ 템플릿 내 각주 ID 실시간 리프레시 로직 (다중 삽입 시 에러 및 중복 방지)
    cleanContent = cleanContent.replace(/data-id="fn_[^"]+"/g, () => {
      return `data-id="fn_${Date.now()}_${Math.floor(Math.random() * 10000)}"`;
    });

    // ★ 일반 텍스트인지, 표/각주가 포함된 HTML인지 판별
    const isHtml = /<[a-z][\s\S]*>/i.test(cleanContent);

    editor.focus();

    if (editor.isContentEditable) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);

      // 단축어가 쳐져 있었다면 해당 길이만큼 블록 지정하여 덮어쓸 준비
      if (range.startContainer.nodeType === 3 && kwLen > 0) {
        const startOffset = Math.max(0, range.startOffset - kwLen);
        range.setStart(range.startContainer, startOffset);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // ★ HTML 렌더링 분기 처리
      if (isHtml) {
        document.execCommand('insertHTML', false, cleanContent);
      } else {
        document.execCommand('insertText', false, cleanContent);
      }

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

  return { bpPopupState, updatePopupState, targetEditorRef, popupStateRef, getCaretCoordinates, closeBpPopup, openTemplateList, commitBpExpansion };
};
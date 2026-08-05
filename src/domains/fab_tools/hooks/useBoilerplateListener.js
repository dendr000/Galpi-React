// 파일 위치: src/domains/fab_tools/hooks/useBoilerplateListener.js
// 기능 요약: 텍스트 입력망을 전역 감시하여 상용구를 즉각 추천하고 발동시키는 물리 이벤트 스캐너
// 버전: v1.0.0

import { useEffect } from 'react';

export const useBoilerplateListener = ({ globalBpList, bpCore, showToast }) => {
  useEffect(() => {
    // 1. 실시간 타이핑 추적 (문장형 역추적 및 추천 팝업 렌더링)
    const handleInput = (e) => {
      if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') return;
      
      const isPreviewOn = localStorage.getItem('galpi-bp-preview') !== 'false';
      if (!isPreviewOn || bpCore.popupStateRef.current.mode === 'choice') return;

      const editor = e.target;
      const textBefore = editor.value.substring(0, editor.selectionStart);
      const currentLine = textBefore.substring(textBefore.lastIndexOf('\n') + 1);

      if (currentLine.length >= 1) {
        const activeCat = localStorage.getItem('galpi-bp-active-folder') || '전체';
        const activeBps = globalBpList.filter(b => activeCat === '전체' || b.category === activeCat || b.category === '공통');

        let suggests = [];
        let keywordLen = 0;
        const checkLimit = Math.max(0, currentLine.length - 30); // 과도한 역추적 연산 방어

        for (let i = checkLimit; i < currentLine.length; i++) {
          let suffix = currentLine.substring(i);
          if (suffix.trim() === '') continue;

          let matched = activeBps.filter(b => b.title.startsWith(suffix));
          if (matched.length > 0) {
            matched.sort((a, b) => {
              if (a.title === suffix && b.title !== suffix) return -1;
              if (b.title === suffix && a.title !== suffix) return 1;
              return a.title.length - b.title.length;
            });
            suggests = matched;
            keywordLen = suffix.length;
            break;
          }
        }

        if (suggests.length > 0) {
          suggests = suggests.filter((v, idx, a) => a.findIndex(t => (t.id === v.id)) === idx);
          const coords = bpCore.getCaretCoordinates(editor, editor.selectionEnd);
          const rect = editor.getBoundingClientRect();
          let topPos = rect.top - editor.scrollTop + coords.y + coords.h + 10;
          let leftPos = rect.left - editor.scrollLeft + coords.x;

          // 뷰포트 오버플로우 보정 안전망
          if (topPos + 200 > window.innerHeight) topPos = window.innerHeight - 210;
          if (leftPos + 250 > window.innerWidth) leftPos = window.innerWidth - 260;

          bpCore.targetEditorRef.current = editor;
          bpCore.updatePopupState({
            active: true, mode: 'suggest', matches: suggests.slice(0, 6),
            selectedIdx: 0, keywordLength: keywordLen, x: leftPos, y: topPos
          });
        } else {
          bpCore.closeBpPopup();
        }
      } else {
        bpCore.closeBpPopup();
      }
    };

    // 2. 키보드 인터셉트 및 단축키 발동 엔진
    const handleKeydown = (e) => {
      if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') return;
      const state = bpCore.popupStateRef.current;
      const editor = e.target;

      // 팝업이 활성화된 상태의 방향키 및 특수키 제어 가로채기
      if (state.active) {
        if (e.key === 'ArrowDown') { e.preventDefault(); bpCore.updatePopupState(p => ({ ...p, selectedIdx: (p.selectedIdx + 1) % p.matches.length })); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); bpCore.updatePopupState(p => ({ ...p, selectedIdx: (p.selectedIdx - 1 + p.matches.length) % p.matches.length })); return; }
        if (e.key === 'Escape') { e.preventDefault(); bpCore.closeBpPopup(); return; }

        if (state.mode === 'choice') {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bpCore.commitBpExpansion(); return; }
          if (e.key >= '1' && e.key <= '9') {
            const idx = parseInt(e.key) - 1;
            if (idx < state.matches.length) { e.preventDefault(); bpCore.commitBpExpansion(idx); }
            return;
          }
        } else if (state.mode === 'suggest') {
          if (e.key === 'Tab' || e.key === 'Enter') {
            if (e.isComposing) return; // 한글 조합 중 엔터 강제 치환 방어
            e.preventDefault(); bpCore.commitBpExpansion(); return;
          }
          if (e.key === ' ') { bpCore.closeBpPopup(); return; }
        }

        const allowedKeys = ['Process', 'Unidentified', 'Shift', 'Control', 'Alt', 'Meta', 'Backspace', 'Delete'];
        if (e.key.length !== 1 && !allowedKeys.includes(e.key)) {
          bpCore.closeBpPopup();
        }
      }

      // 스페이스바 자동 발동 및 수동(Alt+Enter) 발동 트리거 스캔
      const isAuto = localStorage.getItem('galpi-bp-auto') !== 'false' && (e.key === ' ' || e.key === 'Enter') && !e.shiftKey;
      const isManual = e.altKey && e.key === 'Enter';

      if (isManual || isAuto) {
        const textBefore = editor.value.substring(0, editor.selectionStart);
        const activeCat = localStorage.getItem('galpi-bp-active-folder') || '전체';
        const activeBps = globalBpList.filter(b => activeCat === '전체' || b.category === activeCat || b.category === '공통');
        const exactMatches = activeBps.filter(b => textBefore.endsWith(b.title));

        if (exactMatches.length > 0) {
          const maxLength = Math.max(...exactMatches.map(b => b.title.length));
          const longestMatches = exactMatches.filter(b => b.title.length === maxLength);

          if (longestMatches.length === 1) {
            e.preventDefault();
            bpCore.targetEditorRef.current = editor;
            bpCore.popupStateRef.current = { ...bpCore.popupStateRef.current, active: true, matches: longestMatches, selectedIdx: 0, keywordLength: longestMatches[0].title.length };
            bpCore.commitBpExpansion();
            return;
          } else if (longestMatches.length > 1) {
            e.preventDefault();
            bpCore.targetEditorRef.current = editor;
            const coords = bpCore.getCaretCoordinates(editor, editor.selectionEnd);
            const rect = editor.getBoundingClientRect();
            let topPos = rect.top - editor.scrollTop + coords.y + coords.h + 10;
            let leftPos = rect.left - editor.scrollLeft + coords.x;
            bpCore.updatePopupState({
              active: true, mode: 'choice', matches: longestMatches, selectedIdx: 0,
              keywordLength: longestMatches[0].title.length, x: leftPos, y: topPos
            });
            return;
          }
        } else if (isManual) {
          if (showToast) showToast("커서 앞에 일치하는 단축어가 없습니다.");
        }
      }
    };

    // 팝업 외부 클릭 시 안전하게 닫기
    const handleMouseDown = (e) => {
      if (bpCore.popupStateRef.current.active && !e.target.closest('.bp-suggest-popup')) {
        bpCore.closeBpPopup();
      }
    };

    document.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('input', handleInput, true);
    document.addEventListener('mousedown', handleMouseDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeydown, true);
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [globalBpList, bpCore, showToast]);
};
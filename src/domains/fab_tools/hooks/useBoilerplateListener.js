// 파일 위치: src/domains/fab_tools/hooks/useBoilerplateListener.js
// 기능 요약: 텍스트 입력망을 전역 감시하여 상용구를 즉각 추천하고 발동시키는 물리 이벤트 스캐너
// 버전: v2.1.0 (모달 내부 입력 보호 방어막 추가)

import { useEffect } from 'react';

export const useBoilerplateListener = ({ globalBpList, bpCore, showToast }) => {
  useEffect(() => {
    const handleInput = (e) => {
      // ★ 픽스: 모달창 내부에서 발생한 입력은 상용구 센서가 간섭하지 않고 즉시 무시합니다.
      if (e.target.closest('.modal-overlay')) return;

      const isTextarea = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
      const isContentEditable = e.target.isContentEditable;
      if (!isTextarea && !isContentEditable) return;
      
      const isPreviewOn = localStorage.getItem('galpi-bp-preview') !== 'false';
      if (!isPreviewOn || bpCore.popupStateRef.current.mode === 'choice') return;

      const editor = e.target;
      let textBefore = "";

      if (isContentEditable) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editor);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          textBefore = preCaretRange.toString();
        }
      } else {
        textBefore = editor.value.substring(0, editor.selectionStart);
      }

      const currentLine = textBefore.substring(textBefore.lastIndexOf('\n') + 1);

      if (currentLine.length >= 1) {
        const activeCat = localStorage.getItem('galpi-bp-active-folder') || '전체';
        const activeBps = globalBpList.filter(b => activeCat === '전체' || b.category === activeCat || b.category === '공통');

        let suggests = [];
        let keywordLen = 0;
        const checkLimit = Math.max(0, currentLine.length - 30);

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
          const coords = bpCore.getCaretCoordinates(editor, isContentEditable ? null : editor.selectionEnd);
          const rect = editor.getBoundingClientRect();
          
          let topPos = isContentEditable ? coords.y + 8 : rect.top - editor.scrollTop + coords.y + coords.h + 10;
          let leftPos = isContentEditable ? coords.x : rect.left - editor.scrollLeft + coords.x;

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

    const handleKeydown = (e) => {
      // ★ 픽스: 모달창 내부에서 발생한 단축키 이벤트는 낚아채지 않고 즉시 방생시킵니다.
      if (e.target.closest('.modal-overlay')) return;

      const isTextarea = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
      const isContentEditable = e.target.isContentEditable;
      if (!isTextarea && !isContentEditable) return;

      const state = bpCore.popupStateRef.current;
      const editor = e.target;

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
            if (e.isComposing) return;
            e.preventDefault(); bpCore.commitBpExpansion(); return;
          }
          if (e.key === ' ') { bpCore.closeBpPopup(); return; }
        }

        const allowedKeys = ['Process', 'Unidentified', 'Shift', 'Control', 'Alt', 'Meta', 'Backspace', 'Delete'];
        if (e.key.length !== 1 && !allowedKeys.includes(e.key)) {
          bpCore.closeBpPopup();
        }
      }

      const isAuto = localStorage.getItem('galpi-bp-auto') !== 'false' && (e.key === ' ' || e.key === 'Enter') && !e.shiftKey;
      const isManual = e.altKey && e.key === 'Enter';

      if (isManual || isAuto) {
        let textBefore = "";
        if (isContentEditable) {
          const sel = window.getSelection();
          if(sel.rangeCount) {
            const range = sel.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            textBefore = preCaretRange.toString();
          }
        } else {
          textBefore = editor.value.substring(0, editor.selectionStart);
        }

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
            const coords = bpCore.getCaretCoordinates(editor, isContentEditable ? null : editor.selectionEnd);
            const rect = editor.getBoundingClientRect();
            
            let topPos = isContentEditable ? coords.y + 8 : rect.top - editor.scrollTop + coords.y + coords.h + 10;
            let leftPos = isContentEditable ? coords.x : rect.left - editor.scrollLeft + coords.x;
            
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
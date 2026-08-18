// 파일 위치: src/domains/fab_tools/hooks/useBoilerplateListener.js
// 기능 요약: 텍스트 입력망을 전역 감시하여 상용구를 즉각 추천하고 발동시키는 물리 이벤트 스캐너
// 버전: v2.2.0 (다중 리스너 중복 팝업, 투명 공백 매칭 오류, 모달창 입력 먹통 완벽 해결)

import { useEffect } from 'react';

// ContentEditable과 Textarea 환경을 모두 지원하는 무결성 현재 줄 텍스트 추출기
const getCurrentLineText = (editor, isContentEditable) => {
  if (!isContentEditable) {
    const textBefore = editor.value.substring(0, editor.selectionStart);
    return textBefore.substring(textBefore.lastIndexOf('\n') + 1);
  }
  
  const sel = window.getSelection();
  if (!sel.rangeCount) return "";
  const range = sel.getRangeAt(0);
  
  // 현재 커서가 위치한 블록 엘리먼트 탐색
  let block = range.startContainer;
  while (block && block !== editor && !['DIV', 'P', 'LI', 'TH', 'TD', 'TR'].includes(block.tagName)) {
    block = block.parentNode;
  }
  if (!block || block === editor) block = range.startContainer.parentNode;
  
  // 해당 블록 내부에서 커서 이전까지의 노드만 복제
  const preRange = range.cloneRange();
  preRange.selectNodeContents(block);
  preRange.setEnd(range.startContainer, range.startOffset);
  
  const frag = preRange.cloneContents();
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(frag);
  
  // Range.toString()이 무시하는 <br> 태그를 명시적인 \n으로 강제 치환
  const brs = tempDiv.querySelectorAll('br');
  brs.forEach(br => br.replaceWith(document.createTextNode('\n')));
  
  const textBefore = tempDiv.textContent || "";
  return textBefore.substring(textBefore.lastIndexOf('\n') + 1);
};

export const useBoilerplateListener = ({ globalBpList, bpCore, showToast }) => {
  useEffect(() => {
    const handleInput = (e) => {
      // ★ 픽스 3: 다중 마운트된 리스너들이 동일 이벤트를 중복 처리해 팝업을 2개 띄우는 것 방어
      if (e._bpHandled) return;

      const isTextarea = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
      const isContentEditable = e.target.isContentEditable;
      if (!isTextarea && !isContentEditable) return;
      
      // ★ 픽스 4: 상용구 관리 원장(모달) 내부의 입력칸은 탐욕 스캐너 감시망에서 완전히 제외
      if (e.target.closest('.modal-overlay')) return;

      e._bpHandled = true;

      const isPreviewOn = localStorage.getItem('galpi-bp-preview') !== 'false';
      if (!isPreviewOn || bpCore.popupStateRef.current.mode === 'choice') return;

      const editor = e.target;
      let currentLine = getCurrentLineText(editor, isContentEditable);
      
      // ★ 픽스 1 & 2: 에디터 렌더링용 보이지 않는 특수 공백(\u2060 등)을 분쇄하여 스캔 무결성 확보
      currentLine = currentLine.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');

      if (currentLine.length >= 1) {
        const activeCat = localStorage.getItem('galpi-bp-active-folder') || '전체';
        const activeBps = globalBpList.filter(b => activeCat === '전체' || b.category === activeCat || b.category === '공통');

        let suggests = [];
        let keywordLen = 0;
        const checkLimit = Math.max(0, currentLine.length - 30);

        for (let i = checkLimit; i < currentLine.length; i++) {
          let suffix = currentLine.substring(i);
          if (suffix.trim() === '') continue;

          // 대소문자 무시 완벽 매칭
          let matched = activeBps.filter(b => b.title.toLowerCase().startsWith(suffix.toLowerCase()));
          if (matched.length > 0) {
            matched.sort((a, b) => {
              if (a.title.toLowerCase() === suffix.toLowerCase() && b.title.toLowerCase() !== suffix.toLowerCase()) return -1;
              if (b.title.toLowerCase() === suffix.toLowerCase() && a.title.toLowerCase() !== suffix.toLowerCase()) return 1;
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
      // 중복 팝업 제어 락
      if (e._bpHandledKey) return;

      const isTextarea = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
      const isContentEditable = e.target.isContentEditable;
      if (!isTextarea && !isContentEditable) return;

      // 모달 오버레이 내부 차단
      if (e.target.closest('.modal-overlay')) return;

      e._bpHandledKey = true;

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
        let currentLine = getCurrentLineText(editor, isContentEditable);
        
        // ★ 픽스 1: 투명 공백 제거 및 Alt+Enter 시 뒤에 실수로 띄어쓰기를 쳤더라도 무시하고 매칭(trimEnd)
        currentLine = currentLine.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '').trimEnd();

        const activeCat = localStorage.getItem('galpi-bp-active-folder') || '전체';
        const activeBps = globalBpList.filter(b => activeCat === '전체' || b.category === activeCat || b.category === '공통');
        
        // 대소문자 무시 완벽 매칭
        const exactMatches = activeBps.filter(b => currentLine.toLowerCase().endsWith(b.title.toLowerCase()));

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
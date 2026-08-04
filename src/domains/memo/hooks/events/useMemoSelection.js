// 파일 위치: src/domains/memo/hooks/events/useMemoSelection.js
import { useEffect } from 'react';

export const useMemoSelection = ({ editorRef, updateCharCount }) => {

  // 외부 Ctrl+A로 격리된 표와 아코디언의 입력 권한을 클릭/타이핑 시 즉각 원상 복구하는 백그라운드 센서
  useEffect(() => {
    const handleSelectionChange = () => {
      const editor = editorRef.current;
      if (!editor) return;
      const sel = window.getSelection();
      
      if (sel.isCollapsed && editor.classList.contains('galpi-outer-select')) {
        editor.classList.remove('galpi-outer-select');
        const tempDisabled = editor.querySelectorAll('[data-temp-disabled="true"]');
        tempDisabled.forEach(el => {
          el.removeAttribute('data-temp-disabled');
          el.removeAttribute('contenteditable');
        });
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef]);

  const handleSelectAll = (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false;

    let anchor = selection.anchorNode;
    if (anchor.nodeType === 3) anchor = anchor.parentNode;

    // 1순위: 표의 개별 셀(td, th) 내부 포커스 최우선 감지 및 셀 격리 선택
    const cell = anchor.closest('td, th');
    if (cell && editorRef.current.contains(cell)) {
      e.preventDefault(); e.stopPropagation();
      const range = document.createRange();
      range.selectNodeContents(cell);
      selection.removeAllRanges();
      selection.addRange(range);
      updateCharCount();
      return true; 
    }

    // 2순위: 그 외 일반 본문에서 전체 선택 시
    const editableBlock = anchor.closest('[contenteditable="true"]');
    if (editableBlock) {
      e.preventDefault(); e.stopPropagation();
      
      if (editableBlock.id === 'memo-edit-content') {
        editableBlock.classList.add('galpi-outer-select');
        
        const inners = editableBlock.querySelectorAll('table, details');
        inners.forEach(el => {
          el.setAttribute('data-temp-disabled', 'true');
          el.setAttribute('contenteditable', 'false');
        });

        const range = document.createRange();
        range.selectNodeContents(editableBlock);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        const mainEditor = editableBlock.closest('#memo-edit-content');
        if (mainEditor) {
          mainEditor.classList.remove('galpi-outer-select');
          const tempDisabled = mainEditor.querySelectorAll('[data-temp-disabled="true"]');
          tempDisabled.forEach(el => {
            el.removeAttribute('data-temp-disabled');
            el.removeAttribute('contenteditable');
          });
        }
        
        const range = document.createRange();
        range.selectNodeContents(editableBlock);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      updateCharCount();
      return true;
    }
    return false;
  };

  const handleCopy = (e) => {
    const editor = editorRef.current;
    if (editor && editor.classList.contains('galpi-outer-select')) {
      e.preventDefault();
      const clone = editor.cloneNode(true);
      const ignores = clone.querySelectorAll('[contenteditable="false"], [data-temp-disabled="true"]');
      ignores.forEach(el => el.remove());
      
      clone.style.position = 'absolute'; clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      const cleanText = clone.innerText;
      const cleanHTML = clone.innerHTML;
      document.body.removeChild(clone);

      e.clipboardData.setData('text/plain', cleanText);
      e.clipboardData.setData('text/html', cleanHTML);
      
      editor.classList.remove('galpi-outer-select');
      
      const tempDisabled = editor.querySelectorAll('[data-temp-disabled="true"]');
      tempDisabled.forEach(el => {
        el.removeAttribute('data-temp-disabled');
        el.removeAttribute('contenteditable');
      });

      window.getSelection().collapseToEnd();
    }
  };

  return { handleSelectAll, handleCopy };
};
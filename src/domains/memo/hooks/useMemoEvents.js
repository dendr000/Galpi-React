// 파일 위치: src/components/layout/fab/memo/hooks/useMemoEvents.js
import { useEffect } from 'react';

export const useMemoEvents = ({ editorRef, saveMemo, updateCharCount, checkTableFocus, insertFootnote, handleFootnoteClick }) => {

  // ★ 외부 Ctrl+A로 격리된 표와 아코디언의 입력 권한을 클릭/타이핑 시 즉각 원상 복구하는 백그라운드 센서
  useEffect(() => {
    const handleSelectionChange = () => {
      const editor = editorRef.current;
      if (!editor) return;
      const sel = window.getSelection();
      
      // 선택 영역이 해제되거나 커서가 초기화되었을 때
      if (sel.isCollapsed && editor.classList.contains('galpi-outer-select')) {
        editor.classList.remove('galpi-outer-select');
        const tempDisabled = editor.querySelectorAll('[data-temp-disabled="true"]');
        tempDisabled.forEach(el => {
          el.removeAttribute('data-temp-disabled');
          el.removeAttribute('contenteditable'); // 속성 자체를 날려서 상위 에디터의 true를 상속받게 함
        });
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef]);

  const handleTitleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      saveMemo();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      saveMemo();
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
      e.preventDefault(); e.stopPropagation();
      if (insertFootnote) insertFootnote();
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;

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
        return;
      }

      // 2순위: 그 외 일반 본문에서 전체 선택 시
      const editableBlock = anchor.closest('[contenteditable="true"]');
      if (editableBlock) {
        e.preventDefault(); e.stopPropagation();
        
        if (editableBlock.id === 'memo-edit-content') {
          editableBlock.classList.add('galpi-outer-select');
          
          // ★ 핵심 픽스: 껍데기가 사라진 표(table)와 아코디언(details)을 직접 타겟팅하여 자물쇠 체결
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
        return;
      }
    }

    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let node = selection.anchorNode;
        if (node && node.nodeType === 3) node = node.parentNode;
        
        const cell = node?.closest ? node.closest('td, th') : null;
        if (cell && editorRef.current.contains(cell)) {
          e.preventDefault(); 
          
          const row = cell.closest('tr');
          const table = row.closest('table');
          const cellsInRow = Array.from(row.children);
          const colIdx = cellsInRow.indexOf(cell);
          const allCells = Array.from(table.querySelectorAll('td, th'));
          const cellIdx = allCells.indexOf(cell);

          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (cellIdx > 0) {
                const target = allCells[cellIdx - 1];
                const range = document.createRange();
                range.selectNodeContents(target);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            } else {
              if (cellIdx < allCells.length - 1) {
                const target = allCells[cellIdx + 1];
                const range = document.createRange();
                range.selectNodeContents(target);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
              } else {
                const newTr = document.createElement('tr');
                Array.from(row.children).forEach(c => {
                  const td = document.createElement('td');
                  td.style.cssText = c.style.cssText;
                  td.style.resize = 'horizontal';
                  td.style.overflow = 'hidden';
                  td.innerHTML = '<br>';
                  newTr.appendChild(td);
                });
                row.parentNode.appendChild(newTr);
                
                const target = newTr.children[0];
                const range = document.createRange();
                range.selectNodeContents(target);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                updateCharCount();
              }
            }
          } else if (e.key === 'Enter') {
            const nextRow = row.nextElementSibling;
            if (nextRow) {
              const target = nextRow.children[colIdx];
              if (target) {
                const range = document.createRange();
                range.selectNodeContents(target);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            } else {
              const newTr = document.createElement('tr');
              Array.from(row.children).forEach(c => {
                const td = document.createElement('td');
                td.style.cssText = c.style.cssText;
                td.style.resize = 'horizontal';
                td.style.overflow = 'hidden';
                td.innerHTML = '<br>';
                newTr.appendChild(td);
              });
              row.parentNode.appendChild(newTr);
              
              const target = newTr.children[colIdx];
              const range = document.createRange();
              range.selectNodeContents(target);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
              updateCharCount();
            }
          }
          return;
        }
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        updateCharCount();
      }
    }
  };

  const handleCopy = (e) => {
    const editor = editorRef.current;
    if (editor && editor.classList.contains('galpi-outer-select')) {
      e.preventDefault();
      const clone = editor.cloneNode(true);
      // ★ 픽스: 임시로 자물쇠가 걸린 표와 아코디언도 클립보드 복사에서 완벽히 배제
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
      
      // 복사 직후 격리 모드 해제
      const tempDisabled = editor.querySelectorAll('[data-temp-disabled="true"]');
      tempDisabled.forEach(el => {
        el.removeAttribute('data-temp-disabled');
        el.removeAttribute('contenteditable');
      });

      window.getSelection().collapseToEnd();
    }
  };

  const handleEditorClick = (e) => {
    checkTableFocus();
    updateCharCount();

    if (handleFootnoteClick) {
      handleFootnoteClick(e);
    }

    if (e.target.type === 'checkbox' && editorRef.current.contains(e.target)) {
      const isChecked = e.target.checked;
      const nextSpan = e.target.nextElementSibling;
      if (nextSpan) {
        nextSpan.style.textDecoration = isChecked ? 'line-through' : 'none';
        nextSpan.style.color = isChecked ? 'var(--text-secondary)' : 'var(--text-primary)';
      }
      setTimeout(saveMemo, 100); 
    }
  };

  return { handleTitleKeyDown, handleEditorKeyDown, handleCopy, handleEditorClick };
};
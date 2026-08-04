// 파일 위치: src/pages/MemoWorkspace/editor/hooks/useMemoTableCtrl.js
import { useState } from 'react';

export const useMemoTableCtrl = ({ editorRef, activeCellRef, updateCharCount, setFindReplaceVisible }) => {
  const [tableCtrlVisible, setTableCtrlVisible] = useState(false);

  const checkTableFocus = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorRef.current) {
      let node = sel.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      
      if (node && editorRef.current.contains(node)) {
        const cell = node.closest('td, th');
        if (cell) {
          activeCellRef.current = cell;
          setTableCtrlVisible(true);
          setFindReplaceVisible(false);
          return;
        }
      }
    }
    activeCellRef.current = null;
    setTableCtrlVisible(false);
  };

  const addTableRowBelow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const newTr = document.createElement('tr');
    Array.from(tr.children).forEach(c => {
      const td = document.createElement('td');
      td.style.cssText = c.style.cssText;
      td.innerHTML = '<br>';
      newTr.appendChild(td);
    });
    tr.parentNode.insertBefore(newTr, tr.nextSibling);
    updateCharCount();
  };

  const addTableColRight = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const table = activeCellRef.current.closest('table');
    const cellIdx = Array.from(tr.children).indexOf(activeCellRef.current);
    
    table.querySelectorAll('tr').forEach(row => {
      const refCell = row.children[cellIdx];
      if (refCell) {
        const newCell = document.createElement(refCell.tagName);
        newCell.style.cssText = refCell.style.cssText;
        newCell.innerHTML = '<br>';
        row.insertBefore(newCell, refCell.nextSibling);
      }
    });
    updateCharCount();
  };

  const delTableRow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    if (tr.parentNode.children.length <= 1) return alert("최소 1개의 행이 필요합니다.");
    tr.remove();
    setTableCtrlVisible(false);
    activeCellRef.current = null;
    updateCharCount();
  };

  const delTableCol = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const table = activeCellRef.current.closest('table');
    const cellIdx = Array.from(tr.children).indexOf(activeCellRef.current);
    
    if (tr.children.length <= 1) return alert("최소 1개의 열이 필요합니다.");
    table.querySelectorAll('tr').forEach(row => {
      if (row.children[cellIdx]) row.children[cellIdx].remove();
    });
    setTableCtrlVisible(false);
    activeCellRef.current = null;
    updateCharCount();
  };

  return {
    tableCtrlVisible, setTableCtrlVisible, checkTableFocus,
    addTableRowBelow, addTableColRight, delTableRow, delTableCol
  };
};
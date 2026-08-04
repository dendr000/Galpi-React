// 파일 위치: src/components/layout/fab/memo/hooks/useMemoTableCtrl.js
// 기능 요약: 표 내부 포커스 감지, 구조 편집 및 내부 디자인 서식 제어 전담 훅
// 버전: v2.0.0
import { useState } from 'react';

export const useMemoTableCtrl = ({ editorRef, activeCellRef, updateCharCount }) => {
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
          return true;
        }
      }
    }
    activeCellRef.current = null;
    setTableCtrlVisible(false);
    return false; 
  };

  // [기존 구조 제어 로직]
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
    editorRef.current?.focus();
    const tr = activeCellRef.current.closest('tr');
    if (tr.parentNode.children.length <= 1) return alert("표에는 최소 1개의 행이 남아있어야 합니다.");
    
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNode(tr);
    sel.removeAllRanges();
    sel.addRange(range);
    
    document.execCommand('delete', false, null);
    setTableCtrlVisible(false);
    activeCellRef.current = null;
    updateCharCount();
  };

  const delTableCol = () => {
    if (!activeCellRef.current) return;
    editorRef.current?.focus();
    const tr = activeCellRef.current.closest('tr');
    const table = activeCellRef.current.closest('table');
    const cellIdx = Array.from(tr.children).indexOf(activeCellRef.current);
    
    if (tr.children.length <= 1) return alert("표에는 최소 1개의 열이 남아있어야 합니다.");

    const sel = window.getSelection();
    table.querySelectorAll('tr').forEach(row => {
      const cell = row.children[cellIdx];
      if (cell) {
        const range = document.createRange();
        range.selectNode(cell);
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('delete', false, null);
      }
    });
    setTableCtrlVisible(false);
    activeCellRef.current = null;
    updateCharCount();
  };

  const delTable = () => {
    if (!activeCellRef.current) return;
    editorRef.current?.focus();
    const table = activeCellRef.current.closest('table');
    const wrapper = table.closest('div[contenteditable="false"]');
    const targetNode = wrapper || table;

    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNode(targetNode);
    sel.removeAllRanges();
    sel.addRange(range);
    
    document.execCommand('delete', false, null);
    setTableCtrlVisible(false);
    activeCellRef.current = null;
    updateCharCount();
  };

  // [신규 디자인 제어 로직]
  const setCellAlign = (align) => {
    if (!activeCellRef.current) return;
    activeCellRef.current.style.textAlign = align;
    updateCharCount();
  };

  const toggleHeaderRow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const isHeader = tr.querySelector('th') !== null;
    const targetTag = isHeader ? 'td' : 'th';

    const newCells = Array.from(tr.children).map(c => {
      const el = document.createElement(targetTag);
      el.innerHTML = c.innerHTML;
      el.style.cssText = c.style.cssText;
      if (targetTag === 'th') {
        el.style.background = 'var(--table-bg-alt)';
        el.style.color = 'var(--primary-color)';
        el.style.fontWeight = 'bold';
      } else {
        el.style.background = 'var(--surface-color)';
        el.style.color = 'var(--text-primary)';
        el.style.fontWeight = 'normal';
      }
      return el;
    });

    tr.innerHTML = '';
    newCells.forEach(c => tr.appendChild(c));
    activeCellRef.current = newCells[0]; 
    updateCharCount();
  };

  const setCellBgColor = (color) => {
    if (!activeCellRef.current) return;
    activeCellRef.current.style.backgroundColor = color;
    updateCharCount();
  };

  const toggleTableWidth = () => {
    if (!activeCellRef.current) return;
    const table = activeCellRef.current.closest('table');
    if (table.style.width === '100%') {
      table.style.width = 'max-content';
    } else {
      table.style.width = '100%';
    }
    updateCharCount();
  };

  return {
    tableCtrlVisible, setTableCtrlVisible, checkTableFocus,
    addTableRowBelow, addTableColRight, delTableRow, delTableCol, delTable,
    setCellAlign, toggleHeaderRow, setCellBgColor, toggleTableWidth
  };
};
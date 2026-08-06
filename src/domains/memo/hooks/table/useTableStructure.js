// 파일 위치: src/domains/memo/hooks/table/useTableStructure.js
// 기능 요약: 표의 행과 열을 추가하거나, 행/열/표 전체를 삭제(Ctrl+Z 히스토리 보존)하는 구조 변형 물리 엔진

export const useTableStructure = ({ editorRef, activeCellRef, setTableCtrlVisible, updateCharCount }) => {
  const addTableRowBelow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    const newTr = document.createElement('tr');
    Array.from(tr.children).forEach(c => {
      const td = document.createElement('td');
      td.style.cssText = c.style.cssText;
      td.style.resize = 'horizontal';
      td.style.overflow = 'hidden';
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
        newCell.style.resize = 'horizontal';
        newCell.style.overflow = 'hidden';
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

  return { addTableRowBelow, addTableColRight, delTableRow, delTableCol, delTable };
};
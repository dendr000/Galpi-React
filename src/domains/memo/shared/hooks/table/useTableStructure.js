// 파일 위치: src/domains/memo/shared/hooks/table/useTableStructure.js
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

  // ★ execCommand('delete')는 표 안에서는 셀/행 "내용"만 비우고 태그 자체는 안 지운다 — 브라우저가
  // 표를 삐뚤빼뚤(행마다 칸 수가 다른) 상태로 만들지 않으려고 구조 변경성 delete를 막아버리기
  // 때문이다(행 삭제도 열 삭제도 똑같이 셀만 비워지고 실제 행/열이 안 없어지던 버그였음).
  // execCommand 대신 DOM에서 직접 tr/td를 떼어내면 확실히 지워진다 — 다만 이 방식은 브라우저의
  // 네이티브 실행취소(Ctrl+Z) 스택에는 안 잡힌다(execCommand 기반 변경만 자동으로 추적됨).
  const delTableRow = () => {
    if (!activeCellRef.current) return;
    editorRef.current?.focus();
    const tr = activeCellRef.current.closest('tr');
    if (tr.parentNode.children.length <= 1) return alert("표에는 최소 1개의 행이 남아있어야 합니다.");

    tr.remove();
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

    table.querySelectorAll('tr').forEach(row => {
      const cell = row.children[cellIdx];
      if (cell) cell.remove();
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
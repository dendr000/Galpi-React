// 파일 위치: src/domains/memo/shared/hooks/events/useMemoTableNav.js

export const useMemoTableNav = ({ editorRef, updateCharCount }) => {
  const handleTableNavigation = (e) => {
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
        return true; // 엑셀 네비게이션 작동 완료
      }
    }

    // 일반 본문에서의 Tab 띄어쓰기(들여쓰기) 지원
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      updateCharCount();
      return true;
    }

    return false;
  };

  return { handleTableNavigation };
};
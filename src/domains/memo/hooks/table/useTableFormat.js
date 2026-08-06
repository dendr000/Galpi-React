// 파일 위치: src/domains/memo/hooks/table/useTableFormat.js
// 기능 요약: 표 내부의 셀 정렬, 배경색 지정, 제목 행 토글, 표 전체 너비 설정 등 서식과 스타일을 변경하는 모듈

export const useTableFormat = ({ activeCellRef, updateCharCount }) => {
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
      el.style.resize = 'horizontal';
      el.style.overflow = 'hidden';
      
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
    if (table.style.minWidth === '100%') {
      table.style.minWidth = 'auto';
      table.style.width = 'max-content';
    } else {
      table.style.minWidth = '100%';
      table.style.width = 'max-content';
    }
    updateCharCount();
  };

  return { setCellAlign, toggleHeaderRow, setCellBgColor, toggleTableWidth };
};
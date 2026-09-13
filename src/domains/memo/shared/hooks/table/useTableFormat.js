// 파일 위치: src/domains/memo/shared/hooks/table/useTableFormat.js
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
    // ★ 예전엔 두 분기가 똑같이 width를 'max-content'로 넣고 있어서, 버튼을 눌러도
    // 실제로는 아무것도 안 바뀌었다(항상 콘텐츠 크기 모드). "채우기"는 진짜 100%로,
    // "콘텐츠 크기만" 모드는 max-content로 — 전역 CSS의 max-width:100%가 그래도
    // 컨테이너 밖으로 새는 것만은 막아준다.
    if (table.style.minWidth === '100%') {
      table.style.minWidth = 'auto';
      table.style.width = 'max-content';
    } else {
      table.style.minWidth = '100%';
      table.style.width = '100%';
    }
    updateCharCount();
  };

  return { setCellAlign, toggleHeaderRow, setCellBgColor, toggleTableWidth };
};
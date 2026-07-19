// 파일 위치: src/pages/BulkStudio/BulkTable.jsx
// 기능 요약: React Virtual 엔진과 네이티브 Datalist 자동완성 검색 드롭다운이 융합된 테이블 코어

import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import BulkTableRow from './BulkTableRow';

const BulkTable = ({ 
  columns, rows, loading, tabMode, suggestions, 
  handleCellChange, toggleRowCheck, toggleAllChecks, removeRow, removeColumn, 
  changeColOrder, setActiveRowIdx, setBodyModal 
}) => {
  const tableWrapRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableWrapRef.current,
    estimateSize: () => 45, 
    overscan: 10, 
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // ★ 글로벌 DB 검색 결과(suggestions)와 현재 화면의 로컬 데이터를 병합하여 브라우저에 던져줌
  const datalists = useMemo(() => {
    const lists = {};
    columns.forEach(col => {
      // 1.5초 디바운싱으로 받아온 백엔드 글로벌 제안 목록을 우선 삽입
      const set = new Set(suggestions[col] || []); 
      
      // 현재 열려있는 화면에 작성된 데이터도 수집하되, 콤마가 있으면 쪼개서 넣습니다.
      rows.forEach(r => {
        if (r[col] && r[col].toString().trim() !== "") {
          let valStr = r[col].toString().trim();
          if (valStr.includes(',')) {
            valStr.split(',').forEach(part => {
              if (part.trim() !== "") set.add(part.trim());
            });
          } else {
            set.add(valStr);
          }
        }
      });
      lists[col] = Array.from(set);
    });
    return lists;
  }, [columns, rows, suggestions]);

  const handleKeyDown = (e, rowIdx, colName) => {
    if (e.key === 'Tab' && tabMode === 'vertical') {
      e.preventDefault();
      const nextRowIdx = e.shiftKey ? rowIdx - 1 : rowIdx + 1;
      const selector = colName === 'name' 
        ? `.b-name[data-row="${nextRowIdx}"]` 
        : `.b-prop[data-row="${nextRowIdx}"][data-col="${colName}"]`;
      const nextInput = document.querySelector(selector);
      if (nextInput) {
        nextInput.focus();
        setTimeout(() => nextInput.select(), 10);
      }
    }
  };

  const allChecked = rows.length > 0 && rows.every(r => r._checked);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold' }}>로딩 중...</div>;
  if (rows.length === 0) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>작품을 선택해 주세요.</div>;

  return (
    <>
      <div className="tableWrap" ref={tableWrapRef} style={{ overflow: 'auto', height: '100%', position: 'relative' }}>
        <table className="table">
          <thead>
            <tr>
              <th className="sticky-check">
                <input type="checkbox" checked={allChecked} onChange={e => toggleAllChecks(e.target.checked)} title="전체 선택" />
              </th>
              <th className="sticky-delete">삭제</th>
              <th className="sticky-name">이름 (필수)</th>
              {columns.map((col, i) => (
                <th key={col} style={{ width: '150px', minWidth: '150px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <input type="number" value={i + 1} onChange={e => changeColOrder(i, parseInt(e.target.value))} className="bulk-col-order" style={{ width: '35px', textAlign: 'center' }} disabled={col === '부제목'} title="순서 이동" />
                    <button type="button" onClick={() => removeColumn(col)} style={{ border: 'none', background: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', visibility: col === '부제목' ? 'hidden' : 'visible' }}>✖</button>
                  </div>
                  {col}
                </th>
              ))}
              <th className="sticky-body">상세 본문 (모달)</th>
            </tr>
          </thead>
          
          <tbody>
            {virtualItems.length > 0 && (
              <tr style={{ height: `${virtualItems[0].start}px` }}></tr>
            )}
            
            {virtualItems.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <BulkTableRow 
                  key={row.id} 
                  row={row} 
                  rIdx={virtualRow.index} 
                  columns={columns}
                  handleCellChange={handleCellChange}
                  toggleRowCheck={toggleRowCheck}
                  removeRow={removeRow}
                  setActiveRowIdx={setActiveRowIdx}
                  handleKeyDown={handleKeyDown}
                  setBodyModal={setBodyModal}
                />
              );
            })}
            
            {virtualItems.length > 0 && (
              <tr style={{ height: `${rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end}px` }}></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 브라우저 네이티브 자동완성 UI 렌더링 컨테이너 */}
      <div style={{ display: 'none' }}>
        {columns.map(col => (
          <datalist id={`dl-${col}`} key={col}>
            {datalists[col]?.map(val => <option key={val} value={val}></option>)}
          </datalist>
        ))}
      </div>
    </>
  );
};

export default BulkTable;
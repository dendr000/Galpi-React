// 절대 경로: src/domains/macro/tools/table/TableGrid.jsx
// 기능 요약: textarea 기반의 다중 행 입력 지원 및 셀 높이 여백 최적화를 수행하는 표 그리드 컴포넌트 v1.1.0

import React, { useState, useEffect, useCallback } from 'react';

function TableGrid({ 
  grid, focusedCell, setFocusedCell, handleCellChange, 
  selectedCellKeys, setSelectedCellKeys, clearSelectedContents, pasteToSelectedCells 
}) {
  console.log("[TableGrid] 컴포넌트 렌더링 됨");
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, [isDragging]);

  const handleMouseDown = (e, rIndex, cIndex) => {
    setIsDragging(true);
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const cellKey = `${rIndex},${cIndex}`;
    
    if (isCtrlPressed) {
      setDragStart({ r: rIndex, c: cIndex, initialKeys: [...selectedCellKeys] });
      setSelectedCellKeys(Array.from(new Set([...selectedCellKeys, cellKey])));
    } else {
      setDragStart({ r: rIndex, c: cIndex, initialKeys: [] });
      setSelectedCellKeys([cellKey]);
    }
    setFocusedCell({ r: rIndex, c: cIndex });
  };

  const handleMouseEnter = (e, rIndex, cIndex) => {
    if (isDragging && dragStart) {
      const minR = Math.min(dragStart.r, rIndex);
      const maxR = Math.max(dragStart.r, rIndex);
      const minC = Math.min(dragStart.c, cIndex);
      const maxC = Math.max(dragStart.c, cIndex);
      
      const currentBoxKeys = [];
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          currentBoxKeys.push(`${r},${c}`);
        }
      }
      
      const isCtrlPressed = e.ctrlKey || e.metaKey;
      if (isCtrlPressed) {
        setSelectedCellKeys(Array.from(new Set([...dragStart.initialKeys, ...currentBoxKeys])));
      } else {
        setSelectedCellKeys(currentBoxKeys);
      }
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCellKeys.length > 1) {
      e.preventDefault();
      clearSelectedContents();
    }
  };

  const adjustTextareaHeight = useCallback((element) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  }, []);

  return (
    <div 
      className="table-modal-grid-container" 
      tabIndex={0} 
      onKeyDown={handleKeyDown}
      style={{ overflow: 'auto', paddingBottom: '20px', outline: 'none' }}
    >
      <table 
        className="table-modal-grid" 
        style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px', border: '2px solid var(--border-color, #d0d7de)' }}
      >
        <tbody onMouseLeave={() => { if(isDragging) setIsDragging(false); }}>
          {grid.map((row, rIndex) => (
            <tr key={`grid-row-${rIndex}`}>
              {row.map((cell, cIndex) => {
                if (cell.isHidden) return null;

                const isHeaderCell = (rIndex === 0 && !cell.noRowHeader) || cell.headCol;
                const cellStyle = {
                  textAlign: cell.align,
                  fontWeight: cell.bold ? 'bold' : 'normal',
                  fontStyle: cell.italic ? 'italic' : 'normal',
                  textDecoration: cell.strike ? 'line-through' : 'none',
                  backgroundColor: isHeaderCell ? 'var(--table-bg-alt, #f6f8fa)' : 'transparent',
                };

                const cellKey = `${rIndex},${cIndex}`;
                const isSelected = selectedCellKeys.includes(cellKey);

                return (
                  <td 
                    key={`grid-cell-${rIndex}-${cIndex}`} 
                    rowSpan={cell.rowSpan} 
                    colSpan={cell.colSpan}
                    className={isSelected ? 'cell-selected' : ''}
                    style={{ 
                      border: '1px solid var(--border-color, #d0d7de)', 
                      padding: 0,
                      position: 'relative',
                      backgroundColor: cellStyle.backgroundColor
                    }}
                    onMouseDown={(e) => handleMouseDown(e, rIndex, cIndex)}
                    onMouseEnter={(e) => handleMouseEnter(e, rIndex, cIndex)}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 105, 218, 0.15)', pointerEvents: 'none', zIndex: 5 }} />
                    )}
                    
                    {/* 기능: 쓸데없이 높았던 minHeight를 대폭 줄이고 내부 패딩을 최소화하여 컴팩트한 셀 형태 구현 */}
                    <textarea
                      value={cell.text}
                      rows={1}
                      ref={(el) => {
                        if (el) adjustTextareaHeight(el);
                      }}
                      style={{ 
                        ...cellStyle, 
                        width: '100%', 
                        minHeight: '28px',
                        padding: '6px 8px',
                        resize: 'none', 
                        overflowY: 'hidden', 
                        boxSizing: 'border-box',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        pointerEvents: isDragging ? 'none' : 'auto' 
                      }}
                      onFocus={() => {
                        if (!isDragging) {
                          setFocusedCell({ r: rIndex, c: cIndex });
                          setSelectedCellKeys([cellKey]); 
                        }
                      }}
                      onChange={(e) => {
                        adjustTextareaHeight(e.target);
                        handleCellChange(rIndex, cIndex, e.target.value);
                      }}
                      onPaste={(e) => {
                        if (selectedCellKeys.length > 1) {
                          e.preventDefault();
                          const text = e.clipboardData.getData('text');
                          pasteToSelectedCells(text);
                        }
                      }}
                      onCut={(e) => {
                        if (selectedCellKeys.length > 1) {
                          e.preventDefault();
                          e.clipboardData.setData('text/plain', cell.text);
                          clearSelectedContents();
                        }
                      }}
                      placeholder={isHeaderCell ? "헤더" : "내용"}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableGrid;
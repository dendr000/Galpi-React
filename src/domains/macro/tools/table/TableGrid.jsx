// 절대 경로: src/components/macro/tools/table/TableGrid.jsx
// 기능 요약: textarea 기반의 다중 행 입력 지원, Ctrl 키 기반 다중 셀 드래그 선택 및 서식 렌더링을 처리하는 표 그리드 컴포넌트 v1.0.0

import React, { useState, useEffect, useCallback } from 'react';

function TableGrid({ 
  grid, focusedCell, setFocusedCell, handleCellChange, 
  selectedCellKeys, setSelectedCellKeys, clearSelectedContents, pasteToSelectedCells 
}) {
  console.log("[TableGrid] 컴포넌트 렌더링 됨");
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // 기능: 전역 마우스 업 이벤트를 감지하여 드래그 상태를 해제합니다.
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, [isDragging]);

  // 기능: 마우스 클릭 시점의 좌표와 Ctrl 키 여부를 확인하여 다중 선택 모드를 시작합니다.
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

  // 기능: 마우스 드래그 중인 영역의 범위 박스(Bounding Box)를 계산하여 셀들을 선택 배열에 추가합니다.
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

  // 기능: 선택된 셀이 2개 이상일 때 Delete 키를 누르면 일괄 삭제합니다.
  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCellKeys.length > 1) {
      e.preventDefault();
      clearSelectedContents();
    }
  };

  // 기능: textarea의 높이를 내부 콘텐츠(scrollHeight)에 맞춰 동적으로 확장합니다.
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
        style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px', border: '2px solid var(--border-color)' }}
      >
        <tbody onMouseLeave={() => { if(isDragging) setIsDragging(false); }}>
          {grid.map((row, rIndex) => (
            <tr key={`grid-row-${rIndex}`}>
              {row.map((cell, cIndex) => {
                if (cell.isHidden) return null; // 병합으로 숨겨진 셀은 렌더링하지 않음

                // 셀 텍스트 서식 및 정렬 속성 매핑
                const cellStyle = {
                  textAlign: cell.align,
                  fontWeight: cell.bold ? 'bold' : 'normal',
                  fontStyle: cell.italic ? 'italic' : 'normal',
                  textDecoration: cell.strike ? 'line-through' : 'none',
                  backgroundColor: (rIndex === 0) ? 'var(--table-bg-alt)' : 'transparent',
                };

                const cellKey = `${rIndex},${cIndex}`;
                // selectedCellKeys 배열에 존재하는 셀이면 파란색 하이라이트 클래스 적용
                const isSelected = selectedCellKeys.includes(cellKey);

                return (
                  <td 
                    key={`grid-cell-${rIndex}-${cIndex}`} 
                    rowSpan={cell.rowSpan} 
                    colSpan={cell.colSpan}
                    className={isSelected ? 'cell-selected' : ''}
                    style={{ 
                      border: '1px solid var(--border-color)', 
                      padding: 0,
                      position: 'relative',
                      backgroundColor: cellStyle.backgroundColor
                    }}
                    onMouseDown={(e) => handleMouseDown(e, rIndex, cIndex)}
                    onMouseEnter={(e) => handleMouseEnter(e, rIndex, cIndex)}
                  >
                    {/* 하이라이트 시각 효과를 위한 가상 요소 역할 컨테이너 */}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 105, 218, 0.15)', pointerEvents: 'none', zIndex: 5 }} />
                    )}
                    
                    {/* input 태그를 textarea로 대체하여 다중 행 지원 */}
                    <textarea
                      value={cell.text}
                      ref={(el) => {
                        // 초기 렌더링 시 높이 맞춤
                        if (el) adjustTextareaHeight(el);
                      }}
                      style={{ 
                        ...cellStyle, 
                        width: '100%', 
                        minHeight: '44px',
                        padding: '10px',
                        resize: 'none', 
                        overflowY: 'hidden', 
                        boxSizing: 'border-box',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
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
                      placeholder={rIndex === 0 ? "헤더" : "내용"}
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
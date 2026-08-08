// 절대 경로: src/hooks/table/useTableGrid.js
// 기능 요약: 다중 선택, 병합/분할, 서식 토글, 히스토리(Undo/Redo)를 통제하는 표 전용 상태 관리 훅 v6.1.0

import { useState, useCallback } from 'react';
import { parseMarkdownToGrid } from '../../utils/markdownTableParser';

export const useTableGrid = () => {
  console.log("[useTableGrid] 훅 초기화 - 다중 셀 선택 및 병합 시스템 가동");
  
  const [grid, setGridState] = useState([]);
  const [focusedCell, setFocusedCell] = useState(null);
  const [selectedCellKeys, setSelectedCellKeys] = useState([]);
  const [insertCount, setInsertCount] = useState(1);
  const [history, setHistory] = useState({ past: [], future: [] });

  const setGrid = useCallback((action) => {
    setGridState(prev => {
      const nextGrid = typeof action === 'function' ? action(prev) : action;
      const snapshot = prev.map(row => row.map(cell => ({ ...cell })));
      setHistory(h => ({ past: [...h.past, snapshot], future: [] }));
      return nextGrid;
    });
  }, []);

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory(h => ({
      past: h.past.slice(0, -1),
      future: [grid, ...h.future]
    }));
    setGridState(previous);
    setFocusedCell(null);
    setSelectedCellKeys([]);
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory(h => ({
      past: [...h.past, grid],
      future: h.future.slice(1)
    }));
    setGridState(next);
    setFocusedCell(null);
    setSelectedCellKeys([]);
  };

  const initGrid = useCallback((initialMarkdown) => {
    console.log("[useTableGrid] initGrid 실행");
    if (initialMarkdown && initialMarkdown.includes('||')) {
      const parsed = parseMarkdownToGrid(initialMarkdown);
      if (parsed) {
        setGridState(parsed);
        setHistory({ past: [], future: [] });
        setFocusedCell(null);
        setSelectedCellKeys([]);
        return;
      }
    }
    // 기본 3x3 표 초기화
    setGridState(
      Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 3 }, () => ({
          text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false,
          bold: false, italic: false, strike: false
        }))
      )
    );
    setHistory({ past: [], future: [] });
    setFocusedCell(null);
    setSelectedCellKeys([]);
  }, []);

  const handleCellChange = (r, c, value) => {
    setGridState(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], text: value };
      return newGrid;
    });
  };

  const applyToSelection = (callback) => {
    if (!focusedCell && selectedCellKeys.length === 0) return;
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      if (selectedCellKeys.length > 0) {
        selectedCellKeys.forEach(key => {
          const [r, c] = key.split(',').map(Number);
          if (newGrid[r] && newGrid[r][c] && !newGrid[r][c].isHidden) {
            callback(newGrid[r][c]);
          }
        });
      } else if (focusedCell) {
        callback(newGrid[focusedCell.r][focusedCell.c]);
      }
      return newGrid;
    });
  };

  const handleAlignChange = (align) => applyToSelection(cell => { cell.align = align; });
  const clearFormatting = () => applyToSelection(cell => {
    cell.bold = false; cell.italic = false; cell.strike = false;
  });
  const clearSelectedContents = () => applyToSelection(cell => { cell.text = ''; });

  const toggleFormat = (formatType) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      if (selectedCellKeys && selectedCellKeys.length > 0) {
        selectedCellKeys.forEach(key => {
          const [r, c] = key.split(',').map(Number);
          if (newGrid[r] && newGrid[r][c]) {
            newGrid[r][c] = { ...newGrid[r][c], [formatType]: !newGrid[r][c][formatType] };
          }
        });
      } else if (focusedCell) {
        const { r, c } = focusedCell;
        if (newGrid[r] && newGrid[r][c]) {
          newGrid[r][c] = { ...newGrid[r][c], [formatType]: !newGrid[r][c][formatType] };
        }
      }
      return newGrid;
    });
  };

  const pasteToSelectedCells = (text) => {
    applyToSelection(cell => { cell.text = text; });
  };

  const insertRowAt = (targetRIndex, count = 1) => {
    setGrid(prev => {
      let newGrid = prev.map(row => row.map(c => ({ ...c })));
      for (let step = 0; step < count; step++) {
        const currentTargetRIndex = targetRIndex + step;
        const cols = newGrid[0].length;
        const newRow = [];
        
        for (let c = 0; c < cols; c++) {
          let spanningCellFound = false;
          for (let checkR = currentTargetRIndex - 1; checkR >= 0; checkR--) {
            const cell = newGrid[checkR][c];
            if (!cell.isHidden && cell.rowSpan > (currentTargetRIndex - checkR)) {
              cell.rowSpan += 1;
              newRow.push({ text: '', align: cell.align, rowSpan: 1, colSpan: 1, isHidden: true, bold: false, italic: false, strike: false });
              spanningCellFound = true;
              break;
            }
          }
          if (!spanningCellFound) newRow.push({ text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: false, bold: false, italic: false, strike: false });
        }
        newGrid.splice(currentTargetRIndex, 0, newRow);
      }
      return newGrid;
    });
  };

  const removeRowAt = (targetRIndex) => {
    setGrid(prev => {
      if (prev.length <= 1) return prev;
      const newGrid = prev.map(row => row.map(c => ({ ...c })));
      const cols = newGrid[0].length;
      for (let c = 0; c < cols; c++) {
        const cell = newGrid[targetRIndex][c];
        if (!cell.isHidden && cell.rowSpan > 1) {
          const nextRowCell = newGrid[targetRIndex + 1][c];
          Object.assign(nextRowCell, { ...cell, isHidden: false, rowSpan: cell.rowSpan - 1 });
        } else if (cell.isHidden) {
          for (let checkR = targetRIndex - 1; checkR >= 0; checkR--) {
            const upCell = newGrid[checkR][c];
            if (!upCell.isHidden && upCell.rowSpan > (targetRIndex - checkR)) {
              upCell.rowSpan -= 1;
              break;
            }
          }
        }
      }
      newGrid.splice(targetRIndex, 1);
      setFocusedCell(null); setSelectedCellKeys([]);
      return newGrid;
    });
  };

  const insertColAt = (targetCIndex, count = 1) => {
    setGrid(prev => {
      let newGrid = prev.map(row => row.map(c => ({ ...c })));
      for (let step = 0; step < count; step++) {
        const currentTargetCIndex = targetCIndex + step;
        for (let r = 0; r < newGrid.length; r++) {
          let spanningCellFound = false;
          for (let checkC = currentTargetCIndex - 1; checkC >= 0; checkC--) {
            const cell = newGrid[r][checkC];
            if (!cell.isHidden && cell.colSpan > (currentTargetCIndex - checkC)) {
              cell.colSpan += 1;
              newGrid[r].splice(currentTargetCIndex, 0, { text: '', align: cell.align, rowSpan: 1, colSpan: 1, isHidden: true, bold: false, italic: false, strike: false });
              spanningCellFound = true;
              break;
            }
          }
          if (!spanningCellFound) newGrid[r].splice(currentTargetCIndex, 0, { text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false, bold: false, italic: false, strike: false });
        }
      }
      return newGrid;
    });
  };

  const removeColAt = (targetCIndex) => {
    setGrid(prev => {
      if (prev[0].length <= 1) return prev;
      const newGrid = prev.map(row => row.map(c => ({ ...c })));
      for (let r = 0; r < newGrid.length; r++) {
        const cell = newGrid[r][targetCIndex];
        if (!cell.isHidden && cell.colSpan > 1) {
          const nextColCell = newGrid[r][targetCIndex + 1];
          Object.assign(nextColCell, { ...cell, isHidden: false, colSpan: cell.colSpan - 1 });
        } else if (cell.isHidden) {
          for (let checkC = targetCIndex - 1; checkC >= 0; checkC--) {
            const leftCell = newGrid[r][checkC];
            if (!leftCell.isHidden && leftCell.colSpan > (targetCIndex - checkC)) {
              leftCell.colSpan -= 1;
              break;
            }
          }
        }
      }
      newGrid.forEach(row => row.splice(targetCIndex, 1));
      setFocusedCell(null); setSelectedCellKeys([]);
      return newGrid;
    });
  };

  const insertRowAbove = () => focusedCell ? insertRowAt(focusedCell.r, insertCount) : null;
  const insertRowBelow = () => focusedCell ? insertRowAt(focusedCell.r + 1, insertCount) : null;
  const insertColLeft = () => focusedCell ? insertColAt(focusedCell.c, insertCount) : null;
  const insertColRight = () => focusedCell ? insertColAt(focusedCell.c + 1, insertCount) : null;
  const deleteFocusedRow = () => focusedCell ? removeRowAt(focusedCell.r) : null;
  const deleteFocusedCol = () => focusedCell ? removeColAt(focusedCell.c) : null;

  const mergeRight = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      const targetC = c + current.colSpan;
      if (targetC < newGrid[0].length) {
        const target = newGrid[r][targetC];
        if (!target.isHidden && target.rowSpan === current.rowSpan) {
          current.colSpan += target.colSpan;
          for (let rr = 0; rr < target.rowSpan; rr++) {
            for (let cc = 0; cc < target.colSpan; cc++) {
              newGrid[r + rr][targetC + cc].isHidden = true;
              newGrid[r + rr][targetC + cc].text = ''; 
            }
          }
        }
      }
      return newGrid;
    });
  };

  const mergeDown = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      const targetR = r + current.rowSpan;
      if (targetR < newGrid.length) {
        const target = newGrid[targetR][c];
        if (!target.isHidden && target.colSpan === current.colSpan) {
          current.rowSpan += target.rowSpan;
          for (let rr = 0; rr < target.rowSpan; rr++) {
            for (let cc = 0; cc < target.colSpan; cc++) {
              newGrid[targetR + rr][c + cc].isHidden = true;
              newGrid[targetR + rr][c + cc].text = '';
            }
          }
        }
      }
      return newGrid;
    });
  };

  const unmerge = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      if (current.rowSpan > 1 || current.colSpan > 1) {
        for (let rr = 0; rr < current.rowSpan; rr++) {
          for (let cc = 0; cc < current.colSpan; cc++) {
            if (rr === 0 && cc === 0) continue;
            newGrid[r + rr][c + cc].isHidden = false;
          }
        }
        current.rowSpan = 1;
        current.colSpan = 1;
      }
      return newGrid;
    });
  };

  return {
    grid, insertCount, setInsertCount,
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange,
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, deleteFocusedRow, deleteFocusedCol,
    mergeRight, mergeDown, unmerge,
    toggleFormat, clearFormatting, clearSelectedContents, pasteToSelectedCells,
    selectedCellKeys, setSelectedCellKeys,
    undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0
  };
};
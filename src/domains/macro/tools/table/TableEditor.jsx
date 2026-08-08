// 절대 경로: src/domains/macro/tools/table/TableEditor.jsx
// 기능 요약: useTableGrid 훅과 하위 UI(Toolbar, Grid)를 통합하고 마크다운 변환을 수행하며, 부모(MacroToolbar)의 모달 껍데기 내부에 렌더링되는 본문 컴포넌트 v4.0.0

import React, { useEffect } from 'react';
import { useTableGrid } from './useTableGrid';
import TableToolbar from './TableToolbar';
import TableGrid from './TableGrid';
import { generateMarkdownFromGrid } from '../../../../utils/markdownTableParser'; 

const TableEditor = ({ selectedText, onInsert, onCancel }) => {
  console.log("[TableEditor] 통합 컴포넌트 렌더링 됨");

  const { 
    grid, insertCount, setInsertCount,
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange,
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, deleteFocusedRow, deleteFocusedCol,
    mergeRight, mergeDown, unmerge,
    toggleFormat, clearFormatting, clearSelectedContents, pasteToSelectedCells,
    selectedCellKeys, setSelectedCellKeys,
    undo, redo, canUndo, canRedo
  } = useTableGrid();

  // 기능: 모달이 열리면서 컴포넌트가 마운트될 때, 드래그된 마크다운 텍스트를 파싱하여 그리드 초기화
  useEffect(() => {
    initGrid(selectedText);
  }, [selectedText, initGrid]);

  if (grid.length === 0) return null;

  // 기능: '에디터에 삽입' 버튼 클릭 시 객체 그리드를 나무위키 마크다운으로 변환하여 부모로 전달
  const handleApply = () => {
    console.log("[TableEditor] 마크다운 변환 및 본문 삽입 프로세스 가동");
    const markdownOutput = generateMarkdownFromGrid(grid);
    onInsert(markdownOutput);
  };

  return (
    <>
      {/* 모달 Body 영역: 툴바와 그리드가 배치되며, 가로 최소 800px를 확보하여 넓은 시야 제공 */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto', flex: 1, minWidth: '800px', maxHeight: '70vh' }}>
        <TableToolbar 
          grid={grid} 
          focusedCell={focusedCell} 
          selectedCellKeys={selectedCellKeys}
          insertCount={insertCount} 
          setInsertCount={setInsertCount}
          insertRowAbove={insertRowAbove} 
          insertRowBelow={insertRowBelow} 
          insertColLeft={insertColLeft} 
          insertColRight={insertColRight}
          deleteFocusedRow={deleteFocusedRow} 
          deleteFocusedCol={deleteFocusedCol}
          mergeRight={mergeRight} 
          mergeDown={mergeDown} 
          unmerge={unmerge}
          undo={undo} 
          redo={redo} 
          canUndo={canUndo} 
          canRedo={canRedo}
          toggleFormat={toggleFormat} 
          handleAlignChange={handleAlignChange} 
          clearFormatting={clearFormatting}
        />

        <TableGrid 
          grid={grid} 
          focusedCell={focusedCell} 
          setFocusedCell={setFocusedCell} 
          handleCellChange={handleCellChange}
          selectedCellKeys={selectedCellKeys} 
          setSelectedCellKeys={setSelectedCellKeys}
          clearSelectedContents={clearSelectedContents} 
          pasteToSelectedCells={pasteToSelectedCells}
        />
      </div>

      {/* 모달 Footer 영역: 취소 및 삽입 액션 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--border-color, #e1e4e8)' }}>
        <button 
          onClick={onCancel} 
          style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color, #d0d7de)', borderRadius: '6px', cursor: 'pointer' }}
        >
          취소
        </button>
        <button 
          onClick={handleApply} 
          style={{ padding: '8px 16px', background: 'var(--primary-color, #0969da)', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          에디터에 삽입
        </button>
      </div>
    </>
  );
};

export default TableEditor;
// 절대 경로: src/domains/macro/tools/table/TableEditorModal.jsx
// 기능 요약: 표 에디터의 하위 컴포넌트들을 통합하고, 열림/닫힘 상태 및 최종 마크다운 변환 적용(Insert)을 관장하는 최상위 모달 컨테이너 v1.0.0

import React, { useEffect } from 'react';
import { useTableGrid } from './useTableGrid';
import TableToolbar from './TableToolbar';
import TableGrid from './TableGrid';
import { generateMarkdownFromGrid } from '../../../../utils/markdownTableParser'; 

const TableEditorModal = ({ isOpen, onClose, onInsert, initialTableMarkdown }) => {
  console.log("[TableEditorModal] 컴포넌트 렌더링 됨");

  // 1단계에서 작성한 표 전용 상태 관리 훅 호출
  const { 
    grid, insertCount, setInsertCount,
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange,
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, deleteFocusedRow, deleteFocusedCol,
    mergeRight, mergeDown, unmerge,
    toggleFormat, clearFormatting, clearSelectedContents, pasteToSelectedCells,
    selectedCellKeys, setSelectedCellKeys,
    undo, redo, canUndo, canRedo
  } = useTableGrid();

  // 기능: 모달이 열릴 때 전달받은 초기 마크다운 문자열을 파싱하여 그리드 상태를 초기화합니다.
  useEffect(() => {
    if (isOpen) {
      console.log("[TableEditorModal] 모달 오픈 감지 - 초기 마크다운 데이터 파싱 및 그리드 생성 시작");
      initGrid(initialTableMarkdown);
    }
  }, [isOpen, initialTableMarkdown, initGrid]);

  // 모달이 닫혀 있거나 그리드 데이터가 세팅되지 않았다면 렌더링을 중단합니다.
  if (!isOpen || grid.length === 0) {
    return null;
  }

  // 기능: '표 에디터에 삽입' 버튼 클릭 시 현재 객체 그리드를 마크다운 문자열로 변환하여 에디터 본문에 삽입합니다.
  const handleApply = () => {
    console.log("[TableEditorModal] 표 적용 버튼 클릭 - 마크다운 변환 프로세스 가동");
    const markdownOutput = generateMarkdownFromGrid(grid);
    console.log("[TableEditorModal] 변환 완료. 에디터 본문으로 데이터 주입 및 모달을 종료합니다.");
    onInsert(markdownOutput);
    onClose();
  };

  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 9999 
      }}
      onClick={() => {
        console.log("[TableEditorModal] 오버레이 영역 클릭 - 모달을 닫습니다.");
        onClose();
      }}
    >
      <div 
        style={{ 
          backgroundColor: 'var(--bg-color, #ffffff)', 
          width: '80vw', minWidth: '800px', maxWidth: '1200px', maxHeight: '90vh',
          borderRadius: '12px', display: 'flex', flexDirection: 'column', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
        }}
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 모달이 닫히지 않도록 이벤트 전파 차단
      >
        {/* 모달 헤더 영역 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e1e4e8)' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--primary-color, #0969da)' }}>고급 마크다운 표 에디터</h2>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #57606a)' }}
            title="닫기"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* 모달 본문 영역 (툴바 및 그리드 배치) */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto', flex: 1 }}>
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

        {/* 모달 푸터 액션 영역 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--border-color, #e1e4e8)' }}>
          <button 
            className="wiki-btn" 
            onClick={onClose} 
            style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color, #d0d7de)', borderRadius: '6px', cursor: 'pointer' }}
          >
            취소
          </button>
          <button 
            className="wiki-btn" 
            onClick={handleApply} 
            style={{ padding: '8px 16px', background: 'var(--primary-color, #0969da)', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            표 에디터에 삽입
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableEditorModal;
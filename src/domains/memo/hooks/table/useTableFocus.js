// 파일 위치: src/domains/memo/hooks/table/useTableFocus.js
// 기능 요약: 에디터 내에서 표(Table) 셀의 포커스 상태를 감지하여 제어 툴바의 표시 여부를 결정하는 센서 훅

import { useState } from 'react';

export const useTableFocus = ({ editorRef, activeCellRef }) => {
  const [tableCtrlVisible, setTableCtrlVisible] = useState(false);

  const checkTableFocus = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorRef.current) {
      let node = sel.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      
      if (node && editorRef.current.contains(node)) {
        const cell = node.closest('td, th');
        if (cell) {
          activeCellRef.current = cell;
          setTableCtrlVisible(true);
          return true;
        }
      }
    }
    activeCellRef.current = null;
    setTableCtrlVisible(false);
    return false; 
  };

  return { tableCtrlVisible, setTableCtrlVisible, checkTableFocus };
};
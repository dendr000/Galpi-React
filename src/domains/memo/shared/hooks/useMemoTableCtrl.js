// 파일 위치: src/domains/memo/shared/hooks/useMemoTableCtrl.js
// 기능 요약: 표(Table) 내부에서 발생하는 포커스 감지, 구조 변형, 서식 지정 하위 모듈들을 조립하는 중앙 관제탑 훅
import { useTableFocus } from './table/useTableFocus';
import { useTableStructure } from './table/useTableStructure';
import { useTableFormat } from './table/useTableFormat';

export const useMemoTableCtrl = ({ editorRef, activeCellRef, updateCharCount }) => {
  // 1. 포커스 감지 센서 마운트
  const { tableCtrlVisible, setTableCtrlVisible, hasTable, checkTableFocus } = useTableFocus({
    editorRef, activeCellRef
  });

  // 2. 구조(행/열/표) 변형 물리 엔진 마운트
  const structureHooks = useTableStructure({
    editorRef, activeCellRef, setTableCtrlVisible, updateCharCount
  });

  // 3. 서식 및 스타일 제어 엔진 마운트
  const formatHooks = useTableFormat({
    activeCellRef, updateCharCount
  });

  return {
    tableCtrlVisible, setTableCtrlVisible, hasTable, checkTableFocus,
    ...structureHooks,
    ...formatHooks
  };
};
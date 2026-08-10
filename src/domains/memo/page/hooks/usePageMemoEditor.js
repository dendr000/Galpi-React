import { useRef } from 'react';

// 공통 물리 엔진 훅 (Shared)
import { useMemoSave } from '../../shared/hooks/useMemoSave';
import { useMemoFormat } from '../../shared/hooks/useMemoFormat';
import { useMemoTableCtrl } from '../../shared/hooks/useMemoTableCtrl';
import { useMemoEvents } from '../../shared/hooks/useMemoEvents';

// 페이지 에디터 전용 하위 훅 (Editor Core)
import { usePageEditorSync } from './editor/usePageEditorSync';
import { usePageMention } from './editor/usePageMention';

export const usePageMemoEditor = ({ memos, setMemos, activeMemoId, editData, setEditData, currentFolder, navigate }) => {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);

  // 1. 에디터 상태 동기화 (탭 스위칭, 글자 수, 태그, 테마)
  const { charCount, updateCharCount, selectedColor, setSelectedColor, memoTags, setMemoTags } = usePageEditorSync({
    memos, activeMemoId, editData, editorRef, titleRef
  });

  // 2. 멘션 시스템 제어
  const { mentionRangeRef, mentionCandidates, mentionState, setMentionState, handleMentionSelect, handleEditorKeyUp } = usePageMention({
    editorRef, updateCharCount
  });

  // 3. 공통 물리 엔진 마운트 (Shared)
  const { isSaving, handleSaveMemo, handleDeleteMemo } = useMemoSave({
    memos, setMemos, activeMemoId, editData, setEditData,
    titleRef, editorRef, selectedColor, memoTags, setIsEditorOpen: () => {}
  });

  const formatHooks = useMemoFormat({ editorRef, updateCharCount });

  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: formatHooks.setFindReplaceVisible
  });

  const eventHooks = useMemoEvents({
    editorRef, mentionRangeRef, mentionState, setMentionState,
    saveMemo: handleSaveMemo, updateCharCount, checkTableFocus: tableCtrlHooks.checkTableFocus,
    navigate
  });

  // 이벤트 훅 조립: 멘션의 KeyUp 센서에 표 포커스 체커를 병합하여 반환
  const mergedKeyUp = handleEditorKeyUp(tableCtrlHooks.checkTableFocus);

  return {
    editorRef, titleRef, charCount, selectedColor, setSelectedColor,
    memoTags, setMemoTags, mentionCandidates, mentionState,
    isSaving, handleSaveMemo, handleDeleteMemo, handleMentionSelect,
    handleEditorKeyUp: mergedKeyUp,
    ...formatHooks, ...tableCtrlHooks, ...eventHooks, updateCharCount
  };
};
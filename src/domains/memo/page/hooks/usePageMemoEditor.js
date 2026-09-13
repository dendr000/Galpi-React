import { useRef } from 'react';

// 공통 물리 엔진 훅 (Shared)
import { useMemoSave } from '../../shared/hooks/useMemoSave';
import { useMemoFormat } from '../../shared/hooks/useMemoFormat';
import { useMemoTableCtrl } from '../../shared/hooks/useMemoTableCtrl';
import { useMemoEvents } from '../../shared/hooks/useMemoEvents';

// 페이지 에디터 전용 하위 훅 (Editor Core)
import { usePageEditorSync } from './editor/usePageEditorSync';
import { usePageMention } from './editor/usePageMention';

export const usePageMemoEditor = ({
  memos, setMemos, activeMemoId, editData, setEditData, currentFolder, navigate,
  paneType, handleCloseTab, renameTabId, deleteMemo
}) => {
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

  // 현재 탭이 가리키는 실제 메모 객체. useMemoSave/useMemoEvents는 id가 아니라 객체를 받는다.
  const activeMemo = memos.find(m => String(m.id) === String(activeMemoId));

  // 탭이 다른 메모 id를 가리키도록 바꿔치기한다 — 새 메모를 처음 저장해 진짜 id를 받았을 때,
  // 그리고 에디터 안에서 내부 링크를 눌러 같은 탭에서 다른 메모로 갈아탈 때 둘 다 쓰인다.
  const switchActiveMemoId = (newId) => renameTabId(activeMemoId, newId, paneType);

  // 3. 공통 물리 엔진 마운트 (Shared) — 예전엔 이 훅이 기대하는 파라미터 이름과 다르게 넘겨서
  // (memos→memoData, activeMemoId→activeMemo 등) 저장/삭제 버튼이 전부 조용히 무동작이었고,
  // Ctrl+S를 누르면 saveMemo가 undefined라 그대로 런타임 에러가 났다.
  const { isSaving, saveMemo } = useMemoSave({
    activeMemo, memoData: memos, setMemoData: setMemos, currentFolder,
    setActiveMemoId: switchActiveMemoId,
    titleRef, editorRef, memoTags
  });

  const formatHooks = useMemoFormat({ editorRef, updateCharCount });

  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: formatHooks.setFindReplaceVisible
  });

  const eventHooks = useMemoEvents({
    editorRef, mentionRangeRef, mentionState, setMentionState,
    saveMemo, updateCharCount, checkTableFocus: tableCtrlHooks.checkTableFocus,
    setActiveMemoId: switchActiveMemoId,
    navigate
  });

  // 삭제는 이미 목록 화면(usePageFolder)에 있는 로직을 그대로 재사용한다 — 취소하면 false를
  // 돌려주므로, 실제로 지워졌을 때만 탭을 닫는다.
  const handleDeleteMemo = async (e) => {
    const deleted = await deleteMemo(e, activeMemoId);
    if (deleted) handleCloseTab(e, activeMemoId, paneType);
  };

  // 이벤트 훅 조립: 멘션의 KeyUp 센서에 표 포커스 체커를 병합하여 반환
  const mergedKeyUp = handleEditorKeyUp(tableCtrlHooks.checkTableFocus);

  return {
    editorRef, titleRef, charCount, selectedColor, setSelectedColor,
    memoTags, setMemoTags, mentionCandidates, mentionState,
    isSaving, handleSaveMemo: saveMemo, handleDeleteMemo, handleMentionSelect,
    handleEditorKeyUp: mergedKeyUp,
    ...formatHooks, ...tableCtrlHooks, ...eventHooks, updateCharCount
  };
};
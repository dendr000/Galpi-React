import { useState, useEffect, useRef } from 'react';
import { useMemoSave } from './useMemoSave';
import { useMemoFormat } from './useMemoFormat';
import { useMemoEvents } from './useMemoEvents';
import { useMemoFootnote } from './useMemoFootnote';
import { useMemoTableCtrl } from './useMemoTableCtrl';
import { useMemoFindReplace } from './useMemoFindReplace';
import { useMemoLink } from './useMemoLink';
import { useMemoBlockDrag } from './useMemoBlockDrag'; // ★ 누락되었던 물리 엔진 임포트 복구

export const useMemoEditor = ({ activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId, navigate }) => {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [memoTags, setMemoTags] = useState("");

  const updateCharCount = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const total = text.replace(/\s/g, '').length;
    
    const selection = window.getSelection();
    let selected = 0;
    if (selection.rangeCount > 0 && !selection.isCollapsed && editorRef.current.contains(selection.anchorNode)) {
        selected = selection.toString().replace(/\s/g, '').length;
    }
    setCharCount({ selected, total });
  };

  useEffect(() => {
    if (!activeMemo) return;
    if (titleRef.current) titleRef.current.value = activeMemo.title || '';
    if (editorRef.current) {
      let content = activeMemo.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('') && content.includes('\n')) {
        content = content.replace(/\n/g, '');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }
    setMemoTags(activeMemo.tags || "");
  }, [activeMemo?.id]);

  const saveHooks = useMemoSave({
    activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId,
    titleRef, editorRef, memoTags
  });

  const formatHooks = useMemoFormat({ editorRef, updateCharCount });
  const findReplaceHooks = useMemoFindReplace({ editorRef, updateCharCount });

  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: findReplaceHooks.setFindReplaceVisible
  });

  // ★ 픽스 1: 객체({})가 아닌 순서대로 파라미터를 넘겨주어 각주 먹통 버그 해결
  const footnoteHooks = useMemoFootnote(editorRef, updateCharCount, saveHooks.saveMemo);
  
  const linkHooks = useMemoLink({ updateCharCount, saveMemo: saveHooks.saveMemo });

  // ★ 픽스 2: 누락되었던 표/아코디언 드래그 앤 드롭 물리 엔진 재가동
  useMemoBlockDrag({ editorRef, updateCharCount, saveMemo: saveHooks.saveMemo });

  const eventHooks = useMemoEvents({
    editorRef,
    saveMemo: saveHooks.saveMemo,
    updateCharCount,
    checkTableFocus: tableCtrlHooks.checkTableFocus,
    insertFootnote: footnoteHooks.insertFootnote,
    handleFootnoteClick: footnoteHooks.handleFootnoteClick,
    triggerLinkEdit: linkHooks.triggerLinkEdit,
    closeLinkPopover: linkHooks.closeLinkPopover,
    navigate,
    setActiveMemoId
  });

  return {
    editorRef, titleRef, charCount,
    memoTags, setMemoTags,
    ...saveHooks,
    ...formatHooks,
    ...tableCtrlHooks,
    ...findReplaceHooks,
    ...eventHooks,
    footnoteHooks,
    linkHooks
  };
};
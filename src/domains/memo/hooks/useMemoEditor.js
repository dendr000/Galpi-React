import { useState, useEffect, useRef } from 'react';
import { useMemoSave } from './useMemoSave';
import { useMemoFormat } from './useMemoFormat';
import { useMemoEvents } from './useMemoEvents';
import { useMemoFootnote } from './useMemoFootnote';
import { useMemoTableCtrl } from './useMemoTableCtrl';
import { useMemoFindReplace } from './useMemoFindReplace';
import { useMemoLink } from './useMemoLink';
import { useMemoBlockDrag } from './useMemoBlockDrag';
import api from '../../../api/axiosCore';
import { useBoilerplateCore } from '../../fab_tools/hooks/useBoilerplateCore';
import { useBoilerplateListener } from '../../fab_tools/hooks/useBoilerplateListener';
import { useMemoAutoSave } from './useMemoAutoSave';
import { useMemoBookmark } from './useMemoBookmark';

export const useMemoEditor = ({ activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId, navigate }) => {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [memoTags, setMemoTags] = useState("");
  const [globalBpList, setGlobalBpList] = useState([]);

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

  useEffect(() => {
    api.get('/api/boilerplates').then(res => setGlobalBpList(res.data)).catch(() => {});
  }, []);

  const saveHooks = useMemoSave({
    activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId,
    titleRef, editorRef, memoTags
  });

  useMemoAutoSave({
    editorRef,
    titleRef,
    saveMemo: saveHooks.saveMemo,
    activeMemoId: activeMemo?.id
  });

  const formatHooks = useMemoFormat({ editorRef, updateCharCount });
  const findReplaceHooks = useMemoFindReplace({ editorRef, updateCharCount });

  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: findReplaceHooks.setFindReplaceVisible
  });

  const footnoteHooks = useMemoFootnote(editorRef, updateCharCount, saveHooks.saveMemo);
  const linkHooks = useMemoLink({ updateCharCount, saveMemo: saveHooks.saveMemo });
  useMemoBlockDrag({ editorRef, updateCharCount, saveMemo: saveHooks.saveMemo });
  const bookmarkHooks = useMemoBookmark({ editorRef, updateCharCount, saveMemo: saveHooks.saveMemo });

  const bpCore = useBoilerplateCore();
  useBoilerplateListener({ globalBpList, bpCore });

  // ★ 툴바 버튼을 통해 수동으로 템플릿 목록 팝업을 열어주는 래퍼 함수
  const openTemplateList = () => {
    bpCore.openTemplateList(globalBpList, editorRef.current);
  };

  const eventHooks = useMemoEvents({
    editorRef,
    saveMemo: saveHooks.saveMemo,
    updateCharCount,
    checkTableFocus: tableCtrlHooks.checkTableFocus,
    insertFootnote: footnoteHooks.insertFootnote,
    handleFootnoteClick: footnoteHooks.handleFootnoteClick,
    triggerLinkEdit: linkHooks.triggerLinkEdit,
    closeLinkPopover: linkHooks.closeLinkPopover,
    insertBookmark: bookmarkHooks.insertBookmark,
    openBookmarkModal: bookmarkHooks.openBookmarkModal,
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
    linkHooks,
    bookmarkHooks,
    bpPopupState: bpCore.bpPopupState,
    commitBpExpansion: bpCore.commitBpExpansion,
    updatePopupState: bpCore.updatePopupState,
    openTemplateList // ★ 렌더링 컨테이너로 전달
  };
};
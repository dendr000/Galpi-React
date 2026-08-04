// 파일 위치: src/components/layout/fab/memo/hooks/useMemoEditor.js
import { useState, useEffect, useRef } from 'react';
import { useMemoSave } from './useMemoSave';
import { useMemoFormat } from './useMemoFormat';
import { useMemoEvents } from './useMemoEvents';
import { useMemoFootnote } from './useMemoFootnote';
import { useMemoTableCtrl } from './useMemoTableCtrl';
import { useMemoFindReplace } from './useMemoFindReplace';
import { useMemoBlockDrag } from './useMemoBlockDrag'; // ★ 신규 블록 드래그 엔진 임포트

export const useMemoEditor = (props) => {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });

  useEffect(() => {
    if (!props.activeMemo) return;
    if (titleRef.current) titleRef.current.value = props.activeMemo.title || '';
    if (editorRef.current) {
      let content = props.activeMemo.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('<p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }
  }, [props.activeMemo?.id]);

  const updateCharCount = () => {
    if (!editorRef.current) return;
    const total = editorRef.current.innerText.replace(/\n/g, '').length;
    const selection = window.getSelection();
    const selected = selection.toString().length;
    
    if (selected > 0 && editorRef.current.contains(selection.anchorNode)) {
      setCharCount({ selected, total });
    } else {
      setCharCount({ selected: 0, total });
    }
  };

  const { saveMemo, isSaving } = useMemoSave({ ...props, titleRef, editorRef });
  
  const formatHooks = useMemoFormat({ editorRef, updateCharCount });
  const tableCtrlHooks = useMemoTableCtrl({ editorRef, activeCellRef, updateCharCount });
  const findReplaceHooks = useMemoFindReplace({ editorRef, updateCharCount });
  const footnoteHooks = useMemoFootnote(editorRef, updateCharCount, saveMemo);
  
  // ★ 노션 스타일 블록 드래그 물리 엔진 마운트
  useMemoBlockDrag({ editorRef, updateCharCount, saveMemo });

  const checkTableFocusWrapper = () => {
    const isFocused = tableCtrlHooks.checkTableFocus();
    if (isFocused) findReplaceHooks.setFindReplaceVisible(false);
  };

  const eventHooks = useMemoEvents({ 
    editorRef, 
    saveMemo, 
    updateCharCount, 
    checkTableFocus: checkTableFocusWrapper,
    insertFootnote: footnoteHooks.insertFootnote,
    handleFootnoteClick: footnoteHooks.handleFootnoteClick
  });

  return {
    editorRef, titleRef, charCount, isSaving, saveMemo, updateCharCount,
    ...formatHooks, ...tableCtrlHooks, ...findReplaceHooks, ...eventHooks, footnoteHooks
  };
};
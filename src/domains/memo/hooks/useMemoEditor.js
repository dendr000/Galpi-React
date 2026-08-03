// 파일 위치: src/components/layout/fab/memo/useMemoEditor.js
import { useState, useEffect, useRef } from 'react';
import { useMemoSave } from './useMemoSave';
import { useMemoFormat } from './useMemoFormat';
import { useMemoEvents } from './useMemoEvents';

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

  // 1. 저장 훅 바인딩
  const { saveMemo, isSaving } = useMemoSave({ ...props, titleRef, editorRef });
  
  // 2. 포맷팅 훅 바인딩
  const formatHooks = useMemoFormat({ editorRef, activeCellRef, updateCharCount });
  
  // 3. DOM 이벤트 훅 바인딩
  const eventHooks = useMemoEvents({ 
    editorRef, 
    saveMemo, 
    updateCharCount, 
    checkTableFocus: formatHooks.checkTableFocus 
  });

  return {
    editorRef, titleRef, charCount, isSaving, saveMemo, updateCharCount,
    ...formatHooks, ...eventHooks
  };
};
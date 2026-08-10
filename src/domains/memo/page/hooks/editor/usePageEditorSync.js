import { useState, useEffect } from 'react';

export const usePageEditorSync = ({ memos, activeMemoId, editData, editorRef, titleRef }) => {
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [selectedColor, setSelectedColor] = useState('var(--surface-color)');
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

  // 탭 스위칭 시 에디터 내용 및 상태 실시간 동기화
  useEffect(() => {
    if (!activeMemoId) return;

    if (titleRef.current) titleRef.current.value = editData.title || '';
    const targetMemo = memos.find(m => String(m.id) === String(activeMemoId));
    
    if (targetMemo?.themeColor) setSelectedColor(targetMemo.themeColor);
    else setSelectedColor('var(--surface-color)');

    if (targetMemo?.tags) setMemoTags(targetMemo.tags);
    else setMemoTags("");

    if (editorRef.current) {
      let content = targetMemo?.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('<p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }
  }, [activeMemoId, memos, editData.title, editorRef, titleRef]);

  return { charCount, updateCharCount, selectedColor, setSelectedColor, memoTags, setMemoTags };
};
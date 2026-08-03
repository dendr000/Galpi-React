// 파일 위치: src/components/layout/fab/memo/hooks/useMemoEvents.js

export const useMemoEvents = ({ editorRef, saveMemo, updateCharCount, checkTableFocus }) => {
  const handleTitleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      saveMemo();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation();
      saveMemo();
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;

      let anchor = selection.anchorNode;
      if (anchor.nodeType === 3) anchor = anchor.parentNode;

      const editableBlock = anchor.closest('[contenteditable="true"]');
      if (editableBlock) {
        e.preventDefault(); e.stopPropagation();
        
        if (editableBlock.id === 'memo-edit-content') {
          editableBlock.classList.add('galpi-outer-select');
          const range = document.createRange();
          range.selectNodeContents(editableBlock);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          const mainEditor = editableBlock.closest('#memo-edit-content');
          if (mainEditor) mainEditor.classList.remove('galpi-outer-select');
          
          const range = document.createRange();
          range.selectNodeContents(editableBlock);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        updateCharCount();
      }
    }
  };

  const handleCopy = (e) => {
    const editor = editorRef.current;
    if (editor && editor.classList.contains('galpi-outer-select')) {
      e.preventDefault();
      const clone = editor.cloneNode(true);
      const ignores = clone.querySelectorAll('[contenteditable="false"]');
      ignores.forEach(el => el.remove());
      
      clone.style.position = 'absolute'; clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      const cleanText = clone.innerText;
      const cleanHTML = clone.innerHTML;
      document.body.removeChild(clone);

      e.clipboardData.setData('text/plain', cleanText);
      e.clipboardData.setData('text/html', cleanHTML);
      
      editor.classList.remove('galpi-outer-select');
      window.getSelection().collapseToEnd();
    }
  };

  const handleEditorClick = (e) => {
    checkTableFocus();
    updateCharCount();

    if (e.target.type === 'checkbox' && editorRef.current.contains(e.target)) {
      const isChecked = e.target.checked;
      const nextSpan = e.target.nextElementSibling;
      if (nextSpan) {
        nextSpan.style.textDecoration = isChecked ? 'line-through' : 'none';
        nextSpan.style.color = isChecked ? 'var(--text-secondary)' : 'var(--text-primary)';
      }
      setTimeout(saveMemo, 100); 
    }
  };

  return { handleTitleKeyDown, handleEditorKeyDown, handleCopy, handleEditorClick };
};
// 파일 위치: src/pages/MemoWorkspace/editor/hooks/useMemoEvents.js

export const useMemoEvents = ({
  editorRef, handleSaveMemo, updateCharCount, checkTableFocus,
  mentionState, setMentionState, mentionRangeRef
}) => {

  const handleMentionSelect = (item) => {
    console.log(`[useMemoEvents] 멘션 아이템 DOM 삽입: ${item.name}`);
    if (!mentionRangeRef.current) return;
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    range.setStart(mentionRangeRef.current.node, mentionRangeRef.current.startOffset);
    range.setEnd(mentionRangeRef.current.node, mentionRangeRef.current.endOffset);
    range.deleteContents();
    
    const targetUrl = item.type === 'work' ? `/work/${item.id}` : `/work/${item.workId || 1}`;
    const linkHTML = `<a href="${targetUrl}" contenteditable="false" style="color:var(--primary-color); font-weight:bold; text-decoration:none; background:var(--table-bg-alt); padding:2px 6px; border-radius:4px; margin: 0 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">@${item.name}</a>&nbsp;`;
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = linkHTML;
    
    const frag = document.createDocumentFragment();
    let node, lastNode;
    while ((node = tempDiv.firstChild)) { lastNode = frag.appendChild(node); }
    
    range.insertNode(frag);
    
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    setMentionState({ isOpen: false, query: "", x: 0, y: 0 });
    updateCharCount();
  };

  const handleTitleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation(); handleSaveMemo();
    }
    if (e.key === 'Tab') {
      console.log("[useMemoEvents] 제목 입력창 Tab 아웃, 본문 포커스 진입");
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(range);
      }
    }
  };

  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation(); handleSaveMemo();
    }
    if (e.key === 'Escape' && mentionState.isOpen) {
      console.log("[useMemoEvents] ESC 입력에 의한 멘션 팝업 강제 종료");
      setMentionState(prev => ({ ...prev, isOpen: false }));
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;
      let anchor = selection.anchorNode;
      if (anchor.nodeType === 3) anchor = anchor.parentNode;

      const editableBlock = anchor.closest('[contenteditable="true"]');
      if (editableBlock) {
        console.log("[useMemoEvents] Ctrl+A 지역 포커스 격리 선택 수행");
        e.preventDefault(); e.stopPropagation();
        if (editableBlock.id === 'memo-edit-content') {
          editableBlock.classList.add('galpi-outer-select');
        } else {
          const mainEditor = editableBlock.closest('#memo-edit-content');
          if (mainEditor) mainEditor.classList.remove('galpi-outer-select');
        }
        const range = document.createRange();
        range.selectNodeContents(editableBlock);
        selection.removeAllRanges(); selection.addRange(range);
        updateCharCount();
      }
    }
  };

  const handleEditorKeyUp = (e) => {
    checkTableFocus(); 
    updateCharCount();
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    if (range.startContainer.nodeType === 3) {
      const textBeforeCursor = range.startContainer.textContent.slice(0, range.startOffset);
      const match = textBeforeCursor.match(/@([^\s]*)$/);
      
      if (match) {
        console.log(`[useMemoEvents] @ 기호 감지, 팝업 좌표 계산: ${match[1]}`);
        let rect;
        const rects = range.getClientRects();
        if (rects.length > 0) rect = rects[0];
        else {
          const span = document.createElement('span');
          span.appendChild(document.createTextNode('\u200b'));
          range.insertNode(span);
          rect = span.getBoundingClientRect();
          span.parentNode.removeChild(span);
        }
        setMentionState({ isOpen: true, query: match[1], x: rect.left, y: rect.bottom + 8 });
        mentionRangeRef.current = {
          node: range.startContainer,
          startOffset: range.startOffset - match[0].length,
          endOffset: range.startOffset
        };
      } else setMentionState(prev => ({ ...prev, isOpen: false }));
    } else setMentionState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCopy = (e) => {
    console.log("[useMemoEvents] HTML 요소 클린 복사 훅 발동");
    const editor = editorRef.current;
    if (editor && editor.classList.contains('galpi-outer-select')) {
      e.preventDefault();
      const clone = editor.cloneNode(true);
      clone.querySelectorAll('[contenteditable="false"]').forEach(el => el.remove());
      clone.style.position = 'absolute'; clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      const cleanText = clone.innerText; const cleanHTML = clone.innerHTML;
      document.body.removeChild(clone);

      e.clipboardData.setData('text/plain', cleanText); e.clipboardData.setData('text/html', cleanHTML);
      editor.classList.remove('galpi-outer-select'); window.getSelection().collapseToEnd();
    }
  };

  const handleEditorClick = (e) => {
    checkTableFocus(); updateCharCount();
    setMentionState(prev => ({ ...prev, isOpen: false }));

    if (e.target.type === 'checkbox' && editorRef.current.contains(e.target)) {
      console.log("[useMemoEvents] 체크박스 토글 감지, DB 자동 저장 연계");
      const isChecked = e.target.checked;
      const nextSpan = e.target.nextElementSibling;
      if (nextSpan) {
        nextSpan.style.textDecoration = isChecked ? 'line-through' : 'none';
        nextSpan.style.color = isChecked ? 'var(--text-secondary)' : 'var(--text-primary)';
      }
      setTimeout(handleSaveMemo, 100); 
    }
  };

  return {
    handleMentionSelect, handleTitleKeyDown, handleEditorKeyDown,
    handleEditorKeyUp, handleCopy, handleEditorClick
  };
};
import { useState, useRef, useEffect } from 'react';
import api from '../../../api/axiosCore';
import { useMemoSave } from './hooks/useMemoSave';
import { useMemoFormat } from './hooks/useMemoFormat';
import { useMemoTableCtrl } from './hooks/useMemoTableCtrl';
import { useMemoEvents } from './hooks/useMemoEvents';

// ★ navigate 추가
export const useWorkspaceEditor = ({ memos, setMemos, activeMemoId, editData, setEditData, setIsEditorOpen, extractTags, currentFolder, navigate }) => {
  console.log("[useWorkspaceEditor] 에디터 메인 훅(Hub) 마운트 및 하위 모듈 조립 개시");

  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  const mentionRangeRef = useRef(null);

  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [selectedColor, setSelectedColor] = useState('var(--surface-color)');
  const [memoTags, setMemoTags] = useState("");
  
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mentionState, setMentionState] = useState({ isOpen: false, query: "", x: 0, y: 0 });

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
    if (titleRef.current) titleRef.current.value = editData.title || '';
    const targetMemo = memos.find(m => m.id === activeMemoId);
    
    if (targetMemo && targetMemo.themeColor) setSelectedColor(targetMemo.themeColor);
    if (targetMemo && targetMemo.tags) setMemoTags(targetMemo.tags);

    if (editorRef.current) {
      let content = targetMemo?.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('') && content.includes('\n')) {
        content = content.replace(/\n/g, '');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }

    const fetchMentions = async () => {
      try {
        const [worksRes, charsRes] = await Promise.all([
          api.get('/api/works').catch(() => ({ data: [] })),
          api.get('/api/characters').catch(() => ({ data: [] }))
        ]);
        const wList = worksRes.data.map(w => ({ id: w.id, name: w.title, type: 'work' }));
        const cList = charsRes.data.map(c => ({ id: c.id, name: c.name, type: 'character' }));
        setMentionCandidates([...wList, ...cList]);
      } catch (e) {
        console.error("[useWorkspaceEditor] 멘션 후보 로드 실패", e);
      }
    };
    fetchMentions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isSaving, handleSaveMemo, handleDeleteMemo } = useMemoSave({
    memos, setMemos, activeMemoId, editData, setEditData,
    titleRef, editorRef, selectedColor, memoTags, setIsEditorOpen
  });

  const formatHooks = useMemoFormat({ editorRef, updateCharCount });

  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: formatHooks.setFindReplaceVisible
  });

  const handleMentionSelect = (item) => {
    if (!mentionRangeRef.current) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(mentionRangeRef.current.node, mentionRangeRef.current.startOffset);
    range.setEnd(mentionRangeRef.current.node, mentionRangeRef.current.endOffset);
    range.deleteContents();
    
    const targetUrl = item.type === 'work' ? `/work/${item.id}` : `/work/${item.workId || 1}`;
    const linkHTML = `<a href="${targetUrl}" class="wiki-backlink" data-id="${item.id}" data-type="${item.type}">@${item.name}</a>&nbsp;`;
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = linkHTML;
    
    const frag = document.createDocumentFragment();
    let node, lastNode;
    while ((node = tempDiv.firstChild)) {
      lastNode = frag.appendChild(node);
    }
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

  const handleEditorKeyUp = (e) => {
    tableCtrlHooks.checkTableFocus();
    updateCharCount();
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    if (range.startContainer.nodeType === 3) {
      const textBeforeCursor = range.startContainer.textContent.slice(0, range.startOffset);
      const match = textBeforeCursor.match(/@([^\s]*)$/);

      if (match) {
        let rect;
        const rects = range.getClientRects();
        if (rects.length > 0) {
          rect = rects[0];
        } else {
          const span = document.createElement('span');
          span.appendChild(document.createTextNode('\u200b'));
          range.insertNode(span);
          rect = span.getBoundingClientRect();
          span.parentNode.removeChild(span);
        }
        
        setMentionState({
          isOpen: true,
          query: match[1],
          x: rect.left,
          y: rect.bottom + 8
        });

        mentionRangeRef.current = {
          node: range.startContainer,
          startOffset: range.startOffset - match[0].length,
          endOffset: range.startOffset
        };
      } else {
        setMentionState(prev => ({ ...prev, isOpen: false }));
      }
    } else {
      setMentionState(prev => ({ ...prev, isOpen: false }));
    }
  };

  // ★ navigate 인자 전달
  const eventHooks = useMemoEvents({
    editorRef, mentionRangeRef, mentionState, setMentionState,
    handleSaveMemo, updateCharCount, checkTableFocus: tableCtrlHooks.checkTableFocus,
    navigate
  });

  return {
    editorRef, titleRef, charCount, selectedColor, setSelectedColor,
    memoTags, setMemoTags, mentionCandidates, mentionState,
    isSaving, handleSaveMemo, handleDeleteMemo, handleMentionSelect, handleEditorKeyUp,
    ...formatHooks, ...tableCtrlHooks, ...eventHooks, updateCharCount
  };
};
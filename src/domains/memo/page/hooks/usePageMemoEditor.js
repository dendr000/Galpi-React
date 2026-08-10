// 파일 위치: src/domains/memo/page/hooks/usePageMemoEditor.js
// 기능 요약: 메모 페이지 에디터의 하위 훅들을 통합 조립하고 공통 물리 엔진(shared)을 래핑하는 중앙 관제탑 (다중 탭 스위칭 최적화)
import { useState, useEffect, useRef } from 'react';
import api from '../../../../api/axiosCore';

import { useMemoSave } from '../../shared/hooks/useMemoSave';
import { useMemoFormat } from '../../shared/hooks/useMemoFormat';
import { useMemoTableCtrl } from '../../shared/hooks/useMemoTableCtrl';
import { useMemoEvents } from '../../shared/hooks/useMemoEvents';

export const usePageMemoEditor = ({ memos, setMemos, activeMemoId, editData, setEditData, currentFolder, navigate }) => {
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

  // 1. 단 1회 실행: 멘션 후보군 수집 (DB 통신 최적화)
  useEffect(() => {
    const fetchMentions = async () => {
      try {
        const [worksRes, charsRes] = await Promise.all([
          api.get('/api/works').catch(() => ({ data: [] })),
          api.get('/api/characters').catch(() => ({ data: [] }))
        ]);
        const wList = worksRes.data.map(w => ({ id: w.id, name: w.title, type: 'work' }));
        const cList = charsRes.data.map(c => ({ id: c.id, name: c.name, type: 'character' }));
        setMentionCandidates([...wList, ...cList]);
      } catch (e) { console.error("멘션 후보 로드 실패", e); }
    };
    fetchMentions();
  }, []);

  // 2. 탭 스위칭 엔진: 탭(activeMemoId)이 바뀔 때마다 에디터 내용물을 0.1초 만에 갈아끼웁니다.
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
  }, [activeMemoId, memos]); // ★ 탭 전환 핵심 의존성 추가

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

  return {
    editorRef, titleRef, charCount, selectedColor, setSelectedColor,
    memoTags, setMemoTags, mentionCandidates, mentionState,
    isSaving, handleSaveMemo, handleDeleteMemo, handleMentionSelect, handleEditorKeyUp,
    ...formatHooks, ...tableCtrlHooks, ...eventHooks, updateCharCount
  };
};
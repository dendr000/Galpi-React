// 파일 위치: src/domains/memo/page/hooks/usePageMemoEditor.js
// 기능 요약: 메모 페이지 에디터의 하위 훅들을 통합 조립하고 공통 물리 엔진(shared)을 래핑하는 중앙 관제탑 (Barrel Hook)
// 버전: v2.0.1 (공통 모듈 재활용 및 최적화)

import { useState, useEffect, useRef } from 'react';
import api from '../../../../api/axiosCore';

// ★ 팹(FAB) 개편 시 뽑아두었던 shared 공통 물리 엔진 훅들을 그대로 재활용합니다.
import { useMemoSave } from '../../shared/hooks/useMemoSave';
import { useMemoFormat } from '../../shared/hooks/useMemoFormat';
import { useMemoTableCtrl } from '../../shared/hooks/useMemoTableCtrl';
import { useMemoEvents } from '../../shared/hooks/useMemoEvents';

export const usePageMemoEditor = ({ memos, setMemos, activeMemoId, editData, setEditData, setIsEditorOpen, currentFolder, navigate }) => {
  console.log("[usePageMemoEditor] 에디터 메인 훅(Hub) 마운트 및 하위 모듈 조립 개시");

  // 공유 DOM 레퍼런스
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  const mentionRangeRef = useRef(null);

  // 공유 기본 상태
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [selectedColor, setSelectedColor] = useState('var(--surface-color)');
  const [memoTags, setMemoTags] = useState("");
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mentionState, setMentionState] = useState({ isOpen: false, query: "", x: 0, y: 0 });

  // 글자 수 업데이트 공통 함수
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

  // 초기 데이터 바인딩 및 멘션 후보 수집
  useEffect(() => {
    if (titleRef.current) titleRef.current.value = editData.title || '';
    const targetMemo = memos.find(m => String(m.id) === String(activeMemoId));
    
    if (targetMemo?.themeColor) setSelectedColor(targetMemo.themeColor);
    if (targetMemo?.tags) setMemoTags(targetMemo.tags);

    if (editorRef.current) {
      let content = targetMemo?.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('<p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
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
      } catch (e) { console.error("멘션 후보 로드 실패", e); }
    };
    fetchMentions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 모듈 1. 데이터 저장 및 삭제 훅 (shared 모듈 사용)
  const { isSaving, handleSaveMemo, handleDeleteMemo } = useMemoSave({
    memos, setMemos, activeMemoId, editData, setEditData,
    titleRef, editorRef, selectedColor, memoTags, setIsEditorOpen
  });

  // 모듈 2. 포맷 지정 및 찾기/바꾸기 훅 (shared 모듈 사용)
  const formatHooks = useMemoFormat({ editorRef, updateCharCount });

  // 모듈 3. 표 제어 훅 (shared 모듈 사용)
  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: formatHooks.setFindReplaceVisible
  });

  // 모듈 4. DOM 이벤트 및 멘션 훅 (shared 모듈 사용)
  const eventHooks = useMemoEvents({
    editorRef, mentionRangeRef, mentionState, setMentionState,
    saveMemo: handleSaveMemo, updateCharCount, checkTableFocus: tableCtrlHooks.checkTableFocus,
    navigate
  });

  // 멘션 삽입 처리는 컴포넌트 특화 로직이므로 여기에 유지
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
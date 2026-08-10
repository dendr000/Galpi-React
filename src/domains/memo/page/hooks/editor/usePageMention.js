import { useState, useEffect, useRef } from 'react';
import api from '../../../../../api/axiosCore';

export const usePageMention = ({ editorRef, updateCharCount }) => {
  const mentionRangeRef = useRef(null);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mentionState, setMentionState] = useState({ isOpen: false, query: "", x: 0, y: 0 });

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

  // 2. 멘션 노드 DOM 주입
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

  // 3. 타이핑 센서: @ 기호 감지 및 좌표 추적 (외부 체커 함수 주입 허용)
  const handleEditorKeyUp = (checkTableFocus) => (e) => {
    if (checkTableFocus) checkTableFocus();
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

  return { mentionRangeRef, mentionCandidates, mentionState, setMentionState, handleMentionSelect, handleEditorKeyUp };
};
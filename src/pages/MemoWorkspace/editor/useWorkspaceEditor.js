// 파일 위치: src/pages/MemoWorkspace/editor/useWorkspaceEditor.js
// 기능 요약: 에디터 모달의 모든 상태 관리, DOM 조작, 키보드 멘션 스캔 및 API 통신 로직을 전담하는 커스텀 훅
// 버전: v1.0.0

import { useState, useRef, useEffect } from 'react';
import api from '../../../api/axiosCore';

export const useWorkspaceEditor = ({
  memos, setMemos, activeMemoId, editData, setEditData,
  setIsEditorOpen, extractTags, currentFolder
}) => {
  console.log("[useWorkspaceEditor] 에디터 비즈니스 로직 훅 마운트");

  // DOM 레퍼런스
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const activeCellRef = useRef(null);
  const mentionRangeRef = useRef(null);

  // 로컬 상태
  const [charCount, setCharCount] = useState({ selected: 0, total: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [tableCtrlVisible, setTableCtrlVisible] = useState(false);
  const [findReplaceVisible, setFindReplaceVisible] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [selectedColor, setSelectedColor] = useState('var(--surface-color)');

  // 멘션(백링크) 상태
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mentionState, setMentionState] = useState({ isOpen: false, query: "", x: 0, y: 0 });

  useEffect(() => {
    console.log("[useWorkspaceEditor] 기존 메모 데이터 바인딩 및 멘션 후보 수집 초기화");
    
    // 제목 초기화
    if (titleRef.current) titleRef.current.value = editData.title || '';
    const targetMemo = memos.find(m => m.id === activeMemoId);
    
    // 테마 색상 초기화
    if (targetMemo && targetMemo.themeColor) setSelectedColor(targetMemo.themeColor);

    // 본문 내용 초기화 및 줄바꿈 처리
    if (editorRef.current) {
      let content = targetMemo?.content || "";
      if (!content.includes('<div') && !content.includes('<br') && !content.includes('<p>') && content.includes('\n')) {
        content = content.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = content;
      updateCharCount();
    }

    // 멘션 데이터 백그라운드 로드
    const fetchMentions = async () => {
      try {
        const [worksRes, charsRes] = await Promise.all([
          api.get('/api/works').catch(() => ({ data: [] })),
          api.get('/api/characters').catch(() => ({ data: [] }))
        ]);
        const wList = worksRes.data.map(w => ({ id: w.id, name: w.title, type: 'work' }));
        const cList = charsRes.data.map(c => ({ id: c.id, name: c.name, type: 'character' }));
        setMentionCandidates([...wList, ...cList]);
        console.log(`[useWorkspaceEditor] 멘션 후보 데이터 로딩 완료: ${wList.length + cList.length}건`);
      } catch (e) {
        console.error("[useWorkspaceEditor] 멘션 후보 로드 실패", e);
      }
    };
    fetchMentions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCharCount = () => {
    if (!editorRef.current) return;
    const total = editorRef.current.innerText.replace(/\n/g, '').length;
    const selection = window.getSelection();
    const selected = selection.toString().length;
    
    if (selected > 0 && editorRef.current.contains(selection.anchorNode)) setCharCount({ selected, total });
    else setCharCount({ selected: 0, total });
  };

  const handleSaveMemo = async () => {
    console.log("[useWorkspaceEditor] 메모 DB 저장 로직 수행");
    if (!titleRef.current || !editorRef.current) return;
    const title = titleRef.current.value.trim();
    const content = editorRef.current.innerHTML;
    if (!title) return alert("메모 제목을 입력해주세요.");

    const parsedTags = extractTags(content);
    const payload = {
      title, content, folder: editData.folder, updatedAt: Date.now(),
      canvasX: 2500, canvasY: 2500, themeColor: selectedColor, tags: parsedTags
    };

    setIsSaving(true);
    try {
      if (activeMemoId) {
        const originMemo = memos.find(m => m.id === activeMemoId);
        payload.canvasX = originMemo?.canvasX ?? 2500;
        payload.canvasY = originMemo?.canvasY ?? 2500;
        payload.sortOrder = originMemo?.sortOrder ?? -1;
        payload.isLocked = originMemo?.isLocked ?? false;
        payload.isTrash = originMemo?.isTrash ?? false;

        await api.put(`/api/memos/${activeMemoId}`, { ...payload, id: activeMemoId });
        setMemos(prev => prev.map(m => m.id === activeMemoId ? { ...m, ...payload } : m));
      } else {
        const res = await api.post('/api/memos', payload);
        setMemos([res.data, ...memos]);
        setEditData(prev => ({ ...prev, id: res.data.id })); 
      }
      setTimeout(() => setIsSaving(false), 1000);
      console.log("[useWorkspaceEditor] 메모 DB 저장 완료");
    } catch (e) { 
      console.error("[useWorkspaceEditor] 저장 통신 에러", e);
      alert("메모 저장에 실패했습니다."); 
      setIsSaving(false); 
    }
  };

  const handleDeleteMemo = async () => {
    if (window.confirm("이 메모를 영구 삭제하시겠습니까?")) {
      console.log(`[useWorkspaceEditor] 메모 영구 삭제 수행 ID: ${activeMemoId}`);
      try {
        await api.delete(`/api/memos/${activeMemoId}`);
        setMemos(prev => prev.filter(m => m.id !== activeMemoId));
        setIsEditorOpen(false);
      } catch (e) { 
        console.error("[useWorkspaceEditor] 삭제 통신 에러", e);
        alert("삭제 실패"); 
      }
    }
  };

  const handleMentionSelect = (item) => {
    console.log(`[useWorkspaceEditor] 멘션 아이템 DOM 삽입: ${item.name}`);
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

  const handleTitleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); e.stopPropagation(); handleSaveMemo();
    }
    if (e.key === 'Tab') {
      console.log("[useWorkspaceEditor] 제목 입력창 Tab 아웃, 본문 포커스 진입");
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
      console.log("[useWorkspaceEditor] ESC 입력에 의한 멘션 팝업 강제 종료");
      setMentionState(prev => ({ ...prev, isOpen: false }));
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;
      let anchor = selection.anchorNode;
      if (anchor.nodeType === 3) anchor = anchor.parentNode;

      const editableBlock = anchor.closest('[contenteditable="true"]');
      if (editableBlock) {
        console.log("[useWorkspaceEditor] Ctrl+A 지역 포커스 격리 선택 수행");
        e.preventDefault(); e.stopPropagation();
        if (editableBlock.id === 'memo-edit-content') {
          editableBlock.classList.add('galpi-outer-select');
          const range = document.createRange();
          range.selectNodeContents(editableBlock);
          selection.removeAllRanges(); selection.addRange(range);
        } else {
          const mainEditor = editableBlock.closest('#memo-edit-content');
          if (mainEditor) mainEditor.classList.remove('galpi-outer-select');
          const range = document.createRange();
          range.selectNodeContents(editableBlock);
          selection.removeAllRanges(); selection.addRange(range);
        }
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
        console.log(`[useWorkspaceEditor] @ 기호 파싱 감지, 팝업 좌표 계산: ${match[1]}`);
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

  const handleCopy = (e) => {
    console.log("[useWorkspaceEditor] HTML 요소 클린 복사 훅 발동");
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

  const checkTableFocus = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorRef.current) {
      let node = sel.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      
      if (node && editorRef.current.contains(node)) {
        const cell = node.closest('td, th');
        if (cell) {
          activeCellRef.current = cell; setTableCtrlVisible(true); setFindReplaceVisible(false);
          return;
        }
      }
    }
    activeCellRef.current = null; setTableCtrlVisible(false);
  };

  const handleEditorClick = (e) => {
    checkTableFocus(); updateCharCount();
    setMentionState(prev => ({ ...prev, isOpen: false }));

    if (e.target.type === 'checkbox' && editorRef.current.contains(e.target)) {
      console.log("[useWorkspaceEditor] 에디터 내부 체크박스 토글 감지, DB 자동 저장 연계");
      const isChecked = e.target.checked;
      const nextSpan = e.target.nextElementSibling;
      if (nextSpan) {
        nextSpan.style.textDecoration = isChecked ? 'line-through' : 'none';
        nextSpan.style.color = isChecked ? 'var(--text-secondary)' : 'var(--text-primary)';
      }
      setTimeout(handleSaveMemo, 100); 
    }
  };

  const executeCmd = (cmd) => { editorRef.current.focus(); document.execCommand(cmd, false, null); updateCharCount(); };
  const insertHtml = (htmlContent) => { editorRef.current.focus(); document.execCommand('insertHTML', false, htmlContent); updateCharCount(); };

  const executeFindReplace = () => {
    console.log(`[useWorkspaceEditor] 찾기/바꾸기 일괄 치환 실행: ${findText} -> ${replaceText}`);
    if (!findText) return alert("찾을 내용을 입력하세요.");
    if (!editorRef.current) return;
    let repHtml = replaceText.replace(/\\n/g, '<br>');
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = []; let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    
    let changed = false;
    textNodes.forEach(textNode => {
      if (textNode.nodeValue.includes(findText)) {
        const parts = textNode.nodeValue.split(findText);
        const fragment = document.createDocumentFragment();
        parts.forEach((part, index) => {
          fragment.appendChild(document.createTextNode(part));
          if (index < parts.length - 1) {
            const tempDiv = document.createElement('div'); tempDiv.innerHTML = repHtml;
            while(tempDiv.firstChild) { fragment.appendChild(tempDiv.firstChild); }
          }
        });
        textNode.parentNode.replaceChild(fragment, textNode);
        changed = true;
      }
    });
    if (changed) { updateCharCount(); alert("일괄 변경이 완료되었습니다."); } else alert("일치하는 내용을 찾을 수 없습니다.");
  };

  const addTableRowBelow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr'); const newTr = document.createElement('tr');
    Array.from(tr.children).forEach(c => { const td = document.createElement('td'); td.style.cssText = c.style.cssText; td.innerHTML = '<br>'; newTr.appendChild(td); });
    tr.parentNode.insertBefore(newTr, tr.nextSibling); updateCharCount();
  };

  const addTableColRight = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr'); const table = activeCellRef.current.closest('table');
    const cellIdx = Array.from(tr.children).indexOf(activeCellRef.current);
    table.querySelectorAll('tr').forEach(row => {
      const refCell = row.children[cellIdx];
      if (refCell) { const newCell = document.createElement(refCell.tagName); newCell.style.cssText = refCell.style.cssText; newCell.innerHTML = '<br>'; row.insertBefore(newCell, refCell.nextSibling); }
    });
    updateCharCount();
  };

  const delTableRow = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr');
    if (tr.parentNode.children.length <= 1) return alert("최소 1개의 행이 필요합니다.");
    tr.remove(); setTableCtrlVisible(false); activeCellRef.current = null; updateCharCount();
  };

  const delTableCol = () => {
    if (!activeCellRef.current) return;
    const tr = activeCellRef.current.closest('tr'); const table = activeCellRef.current.closest('table');
    const cellIdx = Array.from(tr.children).indexOf(activeCellRef.current);
    if (tr.children.length <= 1) return alert("최소 1개의 열이 필요합니다.");
    table.querySelectorAll('tr').forEach(row => { if (row.children[cellIdx]) row.children[cellIdx].remove(); });
    setTableCtrlVisible(false); activeCellRef.current = null; updateCharCount();
  };

  return {
    editorRef, titleRef, charCount, isSaving, tableCtrlVisible, setTableCtrlVisible,
    findReplaceVisible, setFindReplaceVisible, findText, setFindText, replaceText, setReplaceText,
    selectedColor, setSelectedColor, mentionCandidates, mentionState,
    handleSaveMemo, handleDeleteMemo, handleMentionSelect, handleTitleKeyDown,
    handleEditorKeyDown, handleEditorKeyUp, handleCopy, handleEditorClick, checkTableFocus,
    executeCmd, insertHtml, executeFindReplace, addTableRowBelow, addTableColRight,
    delTableRow, delTableCol, updateCharCount
  };
};
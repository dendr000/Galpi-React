// 파일 위치: src/pages/MemoWorkspace/editor/useWorkspaceEditor.js
// 기능 요약: 분할된 하위 훅들을 통합 조립하여 UI 컴포넌트로 전달하는 중앙 관제탑 (Barrel Hook)
// 버전: v2.0.0
import { useState, useEffect } from 'react';
import api from '../../api/axiosCore';

export const useMemoWorkspaceData = () => {
  console.log("[useWorkspaceEditor] 에디터 메인 훅(Hub) 마운트 및 하위 모듈 조립 개시");

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
    const total = editorRef.current.innerText.replace(/\n/g, '').length;
    const selection = window.getSelection();
    const selected = selection.toString().length;
    if (selected > 0 && editorRef.current.contains(selection.anchorNode)) setCharCount({ selected, total });
    else setCharCount({ selected: 0, total });
  };

  // 초기 데이터 바인딩 및 멘션 후보 수집
  useEffect(() => {
    if (titleRef.current) titleRef.current.value = editData.title || '';
    const targetMemo = memos.find(m => m.id === activeMemoId);
    
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

  // 모듈 1. 데이터 저장 및 삭제 훅
  const { isSaving, handleSaveMemo, handleDeleteMemo } = useMemoSave({
    memos, setMemos, activeMemoId, editData, setEditData,
    titleRef, editorRef, selectedColor, memoTags, setIsEditorOpen
  });

  // 모듈 2. 포맷 지정 및 찾기/바꾸기 훅
  const formatHooks = useMemoFormat({ editorRef, updateCharCount });

  // 모듈 3. 표 제어 훅
  const tableCtrlHooks = useMemoTableCtrl({
    editorRef, activeCellRef, updateCharCount,
    setFindReplaceVisible: formatHooks.setFindReplaceVisible
  });

  // 모듈 4. DOM 이벤트 및 멘션 훅
  const eventHooks = useMemoEvents({
    editorRef, mentionRangeRef, mentionState, setMentionState,
    handleSaveMemo, updateCharCount, checkTableFocus: tableCtrlHooks.checkTableFocus
  });

  return {
    editorRef, titleRef, charCount, selectedColor, setSelectedColor,
    memoTags, setMemoTags, mentionCandidates, mentionState,
    isSaving, handleSaveMemo, handleDeleteMemo,
    ...formatHooks, ...tableCtrlHooks, ...eventHooks, updateCharCount
  };
};
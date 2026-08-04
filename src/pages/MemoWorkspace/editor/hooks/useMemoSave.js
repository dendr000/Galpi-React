// 파일 위치: src/pages/MemoWorkspace/editor/hooks/useMemoSave.js
import { useState } from 'react';
import api from '../../../../api/axiosCore';

export const useMemoSave = ({
  memos, setMemos, activeMemoId, editData, setEditData,
  titleRef, editorRef, selectedColor, memoTags, setIsEditorOpen
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMemo = async () => {
    console.log("[useMemoSave] 메모 DB 저장 로직 수행");
    if (!titleRef.current || !editorRef.current) return;
    const title = titleRef.current.value.trim();
    const content = editorRef.current.innerHTML;
    if (!title) return alert("메모 제목을 입력해주세요.");

    // ★ MemoTagBar에서 쉼표(,)로 변환된 문자열(memoTags)이 그대로 tags 컬럼으로 DB에 직렬화 저장됩니다.
    const payload = {
      title, content, folder: editData.folder, updatedAt: Date.now(),
      canvasX: 2500, canvasY: 2500, themeColor: selectedColor, tags: memoTags
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
      console.log("[useMemoSave] 메모 DB 저장 완료");
    } catch (e) { 
      console.error("[useMemoSave] 저장 통신 에러", e);
      alert("메모 저장에 실패했습니다."); 
      setIsSaving(false); 
    }
  };

  const handleDeleteMemo = async () => {
    if (window.confirm("이 메모를 영구 삭제하시겠습니까?")) {
      console.log(`[useMemoSave] 메모 영구 삭제 수행 ID: ${activeMemoId}`);
      try {
        await api.delete(`/api/memos/${activeMemoId}`);
        setMemos(prev => prev.filter(m => m.id !== activeMemoId));
        setIsEditorOpen(false);
      } catch (e) { 
        console.error("[useMemoSave] 삭제 통신 에러", e);
        alert("삭제 실패"); 
      }
    }
  };

  return { isSaving, handleSaveMemo, handleDeleteMemo };
};
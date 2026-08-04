// 파일 위치: src/domains/memo/hooks/useMemoSave.js
import { useState } from 'react';
import api from '../../../api/axiosCore';

export const useMemoSave = ({
  activeMemo, memoData, setMemoData, currentFolder, setActiveMemoId,
  titleRef, editorRef, memoTags // ★ 전달받은 태그 상태
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const saveMemo = async () => {
    if (!activeMemo || !titleRef.current || !editorRef.current) return;
    const title = titleRef.current.value.trim();
    const content = editorRef.current.innerHTML;

    if (!title) return alert("메모 제목을 입력해주세요.");

    const folder = activeMemo.folder || (currentFolder === "전체 메모" ? "기타" : currentFolder);

    const memoPayload = {
      ...activeMemo,
      title, content, folder,
      updatedAt: Date.now(), sortOrder: activeMemo.sortOrder || -1,
      canvasX: activeMemo.canvasX || 2500, canvasY: activeMemo.canvasY || 2500,
      themeColor: activeMemo.themeColor || 'var(--surface-color)',
      tags: memoTags // ★ DB로 전송될 tags 컬럼에 직렬화 매핑 완비
    };

    const isEdit = !String(activeMemo.id).startsWith("local_");

    if (!isEdit) {
      delete memoPayload.id;
    } else {
      memoPayload.id = activeMemo.id;
    }

    try {
      const url = isEdit ? `/api/memos/${activeMemo.id}` : '/api/memos';
      const method = isEdit ? 'put' : 'post';

      const response = await api[method](url, memoPayload);
      if (!isEdit && response.data?.id) memoPayload.id = response.data.id;
    } catch (error) {
      console.error(error);
    }

    const newData = memoData.map(m => String(m.id) === String(activeMemo.id) ? memoPayload : m);
    setMemoData(newData);
    localStorage.setItem('galpi-memos', JSON.stringify(newData));

    if (!isEdit && memoPayload.id && setActiveMemoId) {
      setActiveMemoId(memoPayload.id);
    }

    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return { isSaving, saveMemo };
};
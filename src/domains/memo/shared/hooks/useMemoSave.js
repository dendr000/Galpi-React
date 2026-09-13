// 파일 위치: src/domains/memo/shared/hooks/useMemoSave.js
import { useState } from 'react';
import api from '../../../../api/axiosCore';

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
    // 로컬 상태(memoPayload.id)엔 항상 기존 id를 들고 있는다 — POST가 실패하면(오프라인 등)
    // id가 사라져서 방금 쓴 메모가 목록에서 고아가 되고 activeMemoId가 더 이상 아무것도
    // 못 찾는 문제가 있었다. 서버로 보내는 요청 바디에서만 id를 뺀다(JSON.stringify는
    // undefined 값을 가진 키를 알아서 생략해준다).
    memoPayload.id = activeMemo.id;

    try {
      const url = isEdit ? `/api/memos/${activeMemo.id}` : '/api/memos';
      const method = isEdit ? 'put' : 'post';
      const payloadToSend = isEdit ? memoPayload : { ...memoPayload, id: undefined };

      const response = await api[method](url, payloadToSend);
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
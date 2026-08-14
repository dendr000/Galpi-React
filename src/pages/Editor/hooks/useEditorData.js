// 파일 위치: src/pages/Editor/hooks/useEditorData.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../api/axiosCore';
import { useEditorState } from './useEditorState';
import { useEditorFetch } from './useEditorFetch';
import { useEditorSave } from './useEditorSave';
import { useEditorAutoSave } from './useEditorAutoSave';

export const useEditorData = () => {
  const [searchParams] = useSearchParams();

  const docType = searchParams.get('type') || 'work';
  const docAction = searchParams.get('action') || 'new';
  const targetId = searchParams.get('id');
  const targetWorkId = searchParams.get('workId');

  // 1. 상태 및 Refs 관리 훅
  const editorState = useEditorState();

  // ★ 백링크용 글로벌 후보군 상태 및 API 패치 추가
  const [backlinkCandidates, setBacklinkCandidates] = useState([]);

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        const [worksRes, charsRes] = await Promise.all([
          api.get('/api/works').catch(() => ({ data: [] })),
          api.get('/api/characters').catch(() => ({ data: [] }))
        ]);
        const wList = worksRes.data.map(w => ({ id: w.id, name: w.title, type: 'work' }));
        const cList = charsRes.data.map(c => ({ id: c.id, name: c.name, type: 'character' }));
        setBacklinkCandidates([...wList, ...cList]);
      } catch (e) {
        console.warn("[useEditorData] 백링크 후보 로드 실패", e);
      }
    };
    fetchMentions();
  }, []);

  // 2. 초기 데이터 패치 훅
  useEditorFetch({
    docType, docAction, targetId, targetWorkId,
    ...editorState
  });

  // 3. 수동 저장 및 뒤로가기 로직 훅
  const { handleGoBack, handleSave } = useEditorSave({
    docType, docAction, targetId, targetWorkId, searchParams,
    ...editorState
  });

  // 4. 자동 저장 감지 훅
  useEditorAutoSave({
    docAction,
    handleSave,
    ...editorState
  });

  return {
    docType, docAction, targetId, targetWorkId,
    ...editorState,
    backlinkCandidates, // ★ 반환값에 백링크 후보군 추가
    handleGoBack, handleSave
  };
};
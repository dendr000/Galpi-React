// 파일 위치: src/pages/Editor/hooks/useEditorData.js
import { useSearchParams } from 'react-router-dom';
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
    handleGoBack, handleSave
  };
};
// 파일 위치: src/pages/Editor/hooks/useEditorAutoSave.js
import { useEffect, useRef } from 'react';

export const useEditorAutoSave = ({
  docAction, loading, title, rawText, overviewText,
  workMeta, charProps, themeColor, cardLabels, isHidden,
  handleSave, setSaveStatus
}) => {
  const autoSaveTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    // 신규 작성 시 최초 1회 POST 전까지는 자동 저장(PUT) 방지
    if (docAction === 'new') return;
    if (loading || !title.trim()) return;

    setSaveStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
    }, 3000);

    return () => clearTimeout(autoSaveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, rawText, overviewText, workMeta, charProps, themeColor, cardLabels, isHidden]);
};
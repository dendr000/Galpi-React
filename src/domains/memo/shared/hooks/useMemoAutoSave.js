// 파일 위치: src/domains/memo/shared/hooks/useMemoAutoSave.js
import { useEffect, useRef } from 'react';

export const useMemoAutoSave = ({ editorRef, titleRef, saveMemo, activeMemoId }) => {
  const timerRef = useRef(null);
  const saveMemoRef = useRef(saveMemo);

  // 글자 수 업데이트 등 잦은 렌더링 시에도 항상 최신 저장 로직(클로저)을 참조하도록 캐싱
  useEffect(() => {
    saveMemoRef.current = saveMemo;
  }, [saveMemo]);

  useEffect(() => {
    const handleInput = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        if (saveMemoRef.current) {
          saveMemoRef.current();
          console.log("[useMemoAutoSave] 3초 타이핑 휴지기 감지: 디바운스 자동 저장 백그라운드 실행");
        }
      }, 3000); // 3초 대기
    };

    const editorNode = editorRef.current;
    const titleNode = titleRef.current;

    // 제목과 본문 영역에 순수 DOM 이벤트 리스너 부착
    if (editorNode) editorNode.addEventListener('input', handleInput);
    if (titleNode) titleNode.addEventListener('input', handleInput);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (editorNode) editorNode.removeEventListener('input', handleInput);
      if (titleNode) titleNode.removeEventListener('input', handleInput);
    };
  }, [editorRef, titleRef, activeMemoId]); // 메모가 변경될 때마다 타이머와 리스너 초기화
};
// 파일 위치: src/domains/memo/shared/hooks/useMemoDictListener.js
// 기능 요약: 메모장(ContentEditable) 내부에서 Alt+H 입력 시 고유명사 한자를 다중 순환 치환하는 물리 엔진
// 버전: v2.1.0 (IndexedDB 로컬 사전 캐시 인덱스 조회 방식 + ref 준비 대기 재도입)

import { useEffect } from 'react';
import { resolveCycleReplacement } from '../../../../utils/dictLocalDb';

export const useMemoDictListener = ({ editorRef }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + H 입력 감지 (★ Alt+Shift+H 단축키와 충돌하지 않도록 !e.shiftKey 조건 추가)
      if (e.altKey && !e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        e.stopPropagation();

        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        if (!selection.rangeCount || !editor.contains(selection.anchorNode)) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        // 텍스트 노드 내부에서만 작동하도록 안전장치
        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const cursorOffset = range.startOffset;
        const textBeforeCursor = textNode.textContent.substring(0, cursorOffset);

        resolveCycleReplacement(textBeforeCursor).then(result => {
          if (!result) return;
          // 조회하는 사이 커서가 다른 노드/위치로 옮겨갔으면 적용하지 않음
          const stillSameSelection = window.getSelection();
          if (!stillSameSelection.rangeCount) return;
          const nowRange = stillSameSelection.getRangeAt(0);
          if (nowRange.startContainer !== textNode || nowRange.startOffset !== cursorOffset) return;

          const { matchLength, replacement } = result;
          // Range 조작을 통해 매칭된 길이만큼 선택 영역으로 잡은 뒤 execCommand로 덮어씌움 (Undo 내역 보존)
          nowRange.setStart(textNode, cursorOffset - matchLength);
          nowRange.setEnd(textNode, cursorOffset);
          stillSameSelection.removeAllRanges();
          stillSameSelection.addRange(nowRange);

          document.execCommand('insertText', false, replacement);
        });
      }
    };

    // ★ FabMemoEditor는 activeMemo가 없으면 <MemoEditorBody>(=editorRef가 실제로 꽂히는 DOM)를
    // 아예 렌더링하지 않는다 — 이 훅은 그보다 앞서(부모 훅 호출 시점에) 실행되므로, 마운트 첫
    // 순간엔 editorRef.current가 항상 null이다. 예전엔 여기 의존성 배열에 globalDictList가
    // 같이 들어있어서, 사전 로딩이 끝나 그 값이 바뀔 때 이 effect가 우연히 한 번 더 돌면서
    // editor가 이미 존재하는 시점에 재부착이 됐었다 — IndexedDB 전환으로 그 의존성을 없애면서
    // "우연한 재시도"가 같이 사라져, 메모를 선택해도 리스너가 영영 안 붙는 회귀가 생겼다.
    // 이제는 그런 우연에 기대지 않고, ref가 실제로 채워질 때까지 직접 기다렸다가 붙인다.
    let editor = editorRef.current;
    let rafId = null;
    if (!editor) {
      const waitForEditor = () => {
        editor = editorRef.current;
        if (editor) {
          editor.addEventListener('keydown', handleKeyDown);
        } else {
          rafId = requestAnimationFrame(waitForEditor);
        }
      };
      waitForEditor();
    } else {
      editor.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (editor) editor.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorRef]);
};
